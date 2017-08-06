// Batch #2: from snapshots saved in the database, build a JSON file saved in `build` folder
var _ = require('lodash')
var async = require('async')
var waterfall = async.waterfall

var helpers = require('../helpers/projects')
var processAllProjects = helpers.processAllProjects
var getProjects = helpers.getProjects
var createSuperproject = helpers.createSuperproject

var getSnapshotData = require('./get-snapshot-data')
var getTags = require('./get-tags')
var write = require('./save-json')

var start = function(batchOptions, done) {
  var defaultOptions = null
  var options = _.defaults(batchOptions, defaultOptions)
  const { logger } = options
  logger.info('> Start `build-data`')
  var result = {
    processed: 0,
    error: 0
  }

  // STEP 1: grab all projects, ignoring "deprecated" and "disabled" projects
  var f1 = function(callback) {
    var defaultSearchOptions = {
      disabled: { $ne: true },
      deprecated: { $ne: true }
    }
    var searchOptions = _.defaults(defaultSearchOptions, options.project)
    getProjects(
      {
        Project: options.models.Project,
        project: searchOptions,
        limit: options.limit,
        logger
      },
      projects => callback(null, projects)
    )
  }

  // STEP 2: get superprojects
  var superprojects = []
  var processProject = function(project, cb) {
    result.processed++
    const opts = {
      Snapshot: options.models.Snapshot,
      debug: options.debug,
      logger
    }
    getSnapshotData(project, opts, function(err, report) {
      if (err) return cb(err)
      var superproject = createSuperproject(project, report)
      superprojects.push(superproject)
      return cb(null, superprojects)
    })
  }

  var f2 = function(projects, callback) {
    processAllProjects(projects, processProject, { logger }, () =>
      callback(null, superprojects)
    )
  }

  // STEP 3: get tags
  var f3 = function(superprojects, callback) {
    getTags({ Tag: options.models.Tag }, function(err, tags) {
      if (err) throw err
      callback(null, {
        // include only projects that have at least one snapshot
        // ( = include only projects created at least 2 days ago)
        projects: superprojects.filter(project => project.deltas.length > 0),
        tags
      })
    })
  }

  // Write the JSON file
  var f4 = function(json, cb) {
    write(json, {}, function(err, result) {
      if (err) throw err
      result.projects = json.projects.length
      result.tags = json.tags.length
      result.date = json.date
      cb(null, result)
    })
  }

  return waterfall([f1, f2, f3, f4], done)
}

module.exports = start
