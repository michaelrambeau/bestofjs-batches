// batch test
var async = require('async')
var waterfall = async.waterfall

var helpers = require('../helpers/projects')
var processAllProjects = helpers.processAllProjects
var getProjects = helpers.getProjects

var start = function(options, done) {
  const logger = options.logger
  logger.info('Start `batch-test`')
  var result = {
    processed: 0
  }

  var f1 = function(callback) {
    getProjects(
      {
        Project: options.models.Project,
        project: options.project,
        logger
      },
      projects => callback(null, projects)
    )
  }

  var processProject = function(project, cb) {
    logger.verbose('Processing', project.toString())
    result.processed++
    return cb()
  }

  var f2 = function(projects, callback) {
    processAllProjects(projects, processProject, { logger }, () =>
      callback(null, result)
    )
  }
  return waterfall([f1, f2], done)
}

module.exports = start
