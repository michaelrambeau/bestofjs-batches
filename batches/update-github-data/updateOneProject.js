var _ = require('lodash')
var async = require('async')
const waterfall = async.waterfall

var github = require('../helpers/github')

var helpers = require('../helpers/snapshots')
var getLastSnapshot = helpers.getLastSnapshot
var isTodaySnapshot = helpers.isTodaySnapshot

function processProject (project, options, done) {
  const { logger } = options
  options.result.processed++
  // Get data from Github API
  const f1 = function (callback) {
    logger.debug('STEP1: get project data from Github API')
    getGithubData(project, (err, json) => {
      if (err) return done(err)
      callback(null, json)
    })
  }

  const f1bis = function (json, callback) {
    const full_name = json.full_name
    logger.debug('STEP1 bis: Get topics by scrapping Github web page', { full_name })
    github.getTopics(full_name)
      .then(result => {
        const { topics } = result
        const nextData = Object.assign({}, json, { topics })
        callback(null, nextData)
      })
      .catch(e => callback(e))
  }

  // Update the project record
  const f2 = function (json, callback) {
    logger.debug('STEP2: update project record from Github data', json)
    project.github = json
    project.save(function (err, result) {
      if (err) {
        options.result.error++
        logger.error(`Unable to save project ${project.toString()} ${err.message}`)
        return callback(err)
      } else {
        logger.verbose('Project saved!', project.toString())
        options.result.updated++
      }
      callback(null, json) // pass json data to the next function
    })
  }

  const f3 = function (json, callback) {
    logger.debug('STEP3: save a snapshot record for today, if needed.')
    const stars = json.stargazers_count
    options.result.stars = options.result.stars + stars
    takeSnapshotIfNeeded(project, stars, { models: options.models, logger }, (err, result) => {
      if (err) {
        options.result.error++
        return callback(err)
      }
      if (result === 1) options.result.created++
      callback(err, result)
    })
  }

  waterfall([f1, f1bis, f2, f3], done)
}

function getGithubData (project, cb) {
  github.getRepoData(project, function (err, json) {
    if (err) {
      return cb(err)
    } else {
      cb(null, parseGithubData(json))
    }
  })
}

function parseGithubData (json) {
  const result1 = _.pick(json, [
    'name',
    'full_name',
    'description',
    'homepage',
    'stargazers_count',
    'pushed_at'
  ])
  const result2 = Object.assign({}, result1, {
    owner_id: _.get(json, 'owner.id'),
    branch: _.get(json, 'default_branch')
  })
  return result2
}

function takeSnapshotIfNeeded (project, stars, options, cb) {
  const { logger } = options
  getLastSnapshot(project, options.models, function (err, snapshot) {
    if (err) return cb(new Error('An error occured when retrieving the last snapshot.' + err.message))
    if (snapshot && isTodaySnapshot(snapshot)) {
      // No snapshot to take, a snapshot has already been taken today!
      logger.verbose('A snapshot already exists for today', project.name, snapshot.stars)
      cb(null, 0)
    } else {
      var data = {
        project: project._id,
        stars,
        createdAt: new Date()
      }
      options.models.Snapshot.create(data, function (err) {
        if (err) return cb(new Error(`Snapshot creation for ${project.toString()} failed: ${err.message}`))
        logger.verbose('Snapshot created!', project.toString(), data.stars)
        return cb(null, 1)
      })
    }
  })
}

module.exports = processProject
