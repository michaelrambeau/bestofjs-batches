// var _ = require('lodash')
const async = require('async')
const waterfall = async.waterfall

const npm = require('../helpers/npm')

function processProject (project, options, done) {
  options.result.processed++

  // Get data from Github API
  const f1 = function (callback) {
    if (project.npm.name === '') {
      return callback(null, {
        npm: {
          name: ''
        }
      })
    }
    if (options.debug) console.log('STEP1: get data from npm registry')
    getNpmData(project, (err, json) => {
      if (err) return done(err)
      callback(null, {
        npm: json
      })
    })
  }

  const f2 = function (json, callback) {
    if (project.npm.name === '') {
      return callback(null, {
        packagequality: {
          quality: 0
        }
      })
    }
    if (options.debug) console.log('STEP2: get data from packagequality.com')
    getPackageQualityData(project, (err, result) => {
      if (err) return done(err)
      callback(null, Object.assign({}, json, {
        packagequality: result
      }))
    })
  }

  // Update the project record
  const f3 = function (json, callback) {
    if (options.debug) console.log('STEP3: update project record')
    project.npm = json.npm
    project.packagequality = json.packagequality
    console.log(project.name, project.packagequality.quality)
    project.save(function (err, result) {
      if (err) {
        options.result.error++
        console.error(`Unable to save project ${project.toString()} ${err.message}`)
        return callback(err)
      } else {
        if (options.debug) console.log('Project saved!', result)
        options.result.updated++
      }
      callback(null, json) // pass json data to the next function
    })
  }

  waterfall([f1, f2, f3], done)
}

function getNpmData (project, cb) {
  npm.getNpmRegistryData(project.npm.name, function (err, result) {
    if (err) return cb(err)
    return cb(null, {
      name: project.npm.name, // don't use result.name here, we don't want to override name because of scoped packages!
      version: result.version,
      dependencies: npm.formatDependencies(result.dependencies)
    })
  })
}

function getPackageQualityData (project, cb) {
  npm.getPackageQualityData(project.npm.name, function (err, result) {
    if (err) return cb(err)
    return cb(null, {
      quality: Math.round(result.quality * 100)
    })
  })
}

module.exports = processProject
