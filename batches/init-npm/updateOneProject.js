const _ = require('lodash')
const async = require('async')
const request = require('request')
const waterfall = async.waterfall

var github = require('../helpers/github')

function processProject(project, options, done) {
  options.result.processed++

  // Get data from Github API
  const f1 = function(callback) {
    if (options.debug) console.log('STEP1: get project data from Github API')
    getGithubData(project, (err, json) => {
      if (err) return done(err)
      callback(null, json)
    })
  }

  const f2 = function(json, callback) {
    const branch = json.default_branch
    if (options.debug) console.log('STEP2: get package.json from', branch)
    getPackage(project, branch, (err, packagejson) => {
      if (err) {
        console.log('Unable to get package.json', project.name, err)
        options.result.error++
        return callback(null, {
          github: Object.assign({}, json, {
            packageJson: false,
            branch
          })
        })
      }
      const result = {
        github: Object.assign({}, json, {
          packageJson: true,
          branch
        }),
        npm: {
          name: project.npm.name || packagejson.name.toLowerCase() // do not overwrite current package name!
        }
      }
      // console.log('GET the package!', result.npm)
      callback(null, result)
    })
  }

  const f3 = function(json, callback) {
    const packageName = json.npm && json.npm.name
    if (!packageName) {
      if (options.debug) console.log('No package.json => no STEP3!')
      return callback(null, json) // do nothing if no package name was found
    }
    if (options.debug) console.log('STEP3: get data from npm registry')
    getNpmRegistryData(packageName, function(err, result) {
      if (err) {
        console.log(project.name, `No npm module "${packageName}"`, err)
        return callback(
          null,
          Object.assign({}, json, {
            npm: {
              name: ''
            }
          })
        )
      }
      const updatedJson = Object.assign({}, json)
      updatedJson.npm = {
        name: result.name,
        version: result.version,
        dependencies: formatDependencies(result.dependencies)
      }
      callback(null, updatedJson)
    })
  }

  // Update the project record
  const f4 = function(json, callback) {
    if (options.debug)
      console.log('STEP4: update project record from Github data')
    project.github = json.github
    if (json.npm) project.npm = json.npm
    project.save(function(err, result) {
      if (err) {
        options.result.error++
        console.error(
          `Unable to save project ${project.toString()} ${err.message}`
        )
        callback(err)
      } else {
        if (options.debug) console.log('Project saved!', result)
        options.result.updated++
      }
      callback(null, json) // pass json data to the next function
    })
  }

  waterfall([f1, f2, f3, f4], done)
}

function getGithubData(project, cb) {
  github.getRepoData(project, function(err, json) {
    if (err) {
      return cb(err)
    } else {
      cb(null, parseGithubData(json))
    }
  })
}

function getPackage(project, branch, cb) {
  github.getPackage(project, branch, function(err, json) {
    if (err) {
      return cb(err)
    } else {
      cb(null, json)
    }
  })
}

function parseGithubData(json) {
  const result = _.pick(json, [
    'name',
    'full_name',
    'description',
    'homepage',
    'stargazers_count',
    'pushed_at',
    'default_branch'
  ])
  return result
}

module.exports = processProject
