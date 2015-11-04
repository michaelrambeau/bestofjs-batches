// DAILY BUILD PART 1 (November 2015 version)
// Steps:
// - Loop through all projects
// - Get data from Github API
// - Update project record with Github data
// - Get the last snapshot record saved in the database
// IF it is not today's snapshot =>
//   - save a "snapshot" record in the database

var _ = require('lodash');
var async = require('async');
var waterfall = async.waterfall;
import updateProject from './updateOneProject';

const { processAllProjects, getProjects } = require('../helpers/projects');

var start = function(batchOptions, done) {
  var defaultOptions = {
    result: {
      processed: 0,
      updated: 0,
      created: 0,
      error: 0,
      stars: 0
    }
  };
  var options = _.defaults(batchOptions, defaultOptions);
  console.log('> Start `update-github-data` batch');


  //STEP 1: grab all projects
  var f1 = function(callback) {
    getProjects({
      Project: options.models.Project,
      project: options.project,
      limit: options.limit
    },
      (projects) =>  callback(null, projects) );
  };

  const processProject = function (project, cb) {
    updateProject(project, options, function (err) {
      if (err) {
        console.error(`Unable to process ${project.toString()}: ${err.message}`);
        options.result.error++;
      }
      cb(null, true);
    });
  };

  //STEP 2: take the snapshot for every project (if it has been already taken today)
  var f2 = function(projects, callback) {
    processAllProjects(
      projects,
      processProject,
      null,
      () => callback(null, options.result) );
  };

  return waterfall([f1, f2], done);
};

module.exports = start;
