// DAILY BUILD PART 1 (November 2015 version)
// Steps:
// - Loop through all projects
// - Get data from Github API
// - Update project record with Github data
// - Get the last snapshot record saved in the database
// IF it is not today's snapshot =>
//   - save a "snapshot" record in the database

const _ = require('lodash')
const async = require('async')
const waterfall = async.waterfall
const updateProject = require('./updateOneProject')

const helpers = require('../helpers/projects')
const processAllProjects = helpers.processAllProjects
const getProjects = helpers.getProjects

const start = function (batchOptions, done) {
  const defaultOptions = {
    result: {
      processed: 0,
      updated: 0,
      created: 0,
      error: 0
    }
  }
  const options = _.defaults(batchOptions, defaultOptions)
  console.log('> Start `update-npm-data` batch')

  // STEP 1: grab all projects, exluding "deprecated" projects
  const f1 = function (callback) {
    const defaultSearchOptions = {
      deprecated: {$ne: true},
      'npm.name': {$ne: ''}
    }
    const searchOptions = _.defaults(defaultSearchOptions, options.project)
    getProjects({
      Project: options.models.Project,
      project: searchOptions,
      limit: options.limit
    },
      (projects) => callback(null, projects))
  }

  const processProject = function (project, cb) {
    updateProject(project, options, function (err) {
      if (err) {
        console.error(`Unable to process ${project.toString()}: ${err.message}`)
        options.result.error++
      }
      cb(null, true)
    })
  }

  // STEP 2: take the snapshot for every project (if it has been already taken today)
  const f2 = function (projects, callback) {
    processAllProjects(
      projects,
      processProject,
      null,
      () => callback(null, options.result))
  }

  return waterfall([f1, f2], done)
}

module.exports = start
