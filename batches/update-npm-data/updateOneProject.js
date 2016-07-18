// var _ = require('lodash')
const async = require('async')
const waterfall = async.waterfall
const _ = require('lodash')
const { mapValues } = _
const npm = require('../helpers/npm')

function processProject (project, options, done) {
  const { logger } = options
  options.result.processed++

  // Get data from npm registry
  const stepNpm = function (callback) {
    if (project.npm.name === '') {
      return callback(null, {
        npm: {
          name: ''
        }
      })
    }
    logger.debug('STEP1: get data from npm registry')
    getNpmData(project, (err, json) => {
      if (err) return done(err)
      callback(null, {
        npm: json
      })
    })
  }

  // packagequality.com API
  const stepPackageQuality = function (json, callback) {
    if (project.npm.name === '') {
      return callback(null, {
        packagequality: {}
      })
    }
    logger.debug('STEP2: get data from packagequality.com')
    getPackageQualityData(project, (err, result) => {
      if (err) return done(err)
      callback(null, Object.assign({}, json, {
        packagequality: result
      }))
    })
  }

  // npms.io API
  const stepNpms = function (json, callback) {
    if (project.npm.name === '') {
      return callback(null, {
        npms: {}
      })
    }
    logger.debug('STEP3: get data npms.io')
    npm.getNpmsData(project.npm.name, function (err, result) {
      if (err) return callback(err)
      const npmsScore = result.score
      const score = {
        detail: mapValues(npmsScore.detail, formatScore),
        final: formatScore(npmsScore.final)
      }
      callback(null, Object.assign({}, json, {
        npms: {
          score
        }
      }))
    })
  }

  // Update the project record
  const stepDb = function (json, callback) {
    logger.debug('STEP4: update project record')
    const { npm, packagequality, npms } = json
    // don't use `Object.assign()` to create a new project,
    // it seems it does not work with Mongoose objects
    project.npm = npm
    project.npms = npms
    project.packagequality = packagequality
    project.save(function (err, result) {
      if (err) {
        options.result.error++
        logger.error(`Unable to save project ${project.toString()} ${err.message}`)
        return callback(err)
      } else {
        logger.debug('Project saved!', project.toString())
        options.result.updated++
      }
      callback(null, json) // pass json data to the next function
    })
  }

  const steps = [
    stepNpm,
    stepPackageQuality,
    stepNpms,
    stepDb
  ]
  waterfall(steps, done)
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
      quality: formatScore(result.quality)
    })
  })
}

// Format score numbers from packagequality.com and npms.im into percents, with no decimals
const formatScore = (score) => Math.round(score * 100)

module.exports = processProject
