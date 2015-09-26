// DAILY BUILD PART 1
// Steps:
// - Loop through all projects
// - Get the last snapshot record saved in the database
// IF it is not today's snapshot =>
//   - get the stars count from Github
//   - save a "snapshot" record in the database

var _ = require('lodash');
var async = require('async');
var waterfall = async.waterfall;

const { processAllProjects, getProjects } = require('../helpers/projects');
const { takeOneSnapshot } = require('./takeOneSnapshot');

var start = function(batchOptions, done) {
  var defaultOptions = null;
  var options = _.defaults(batchOptions, defaultOptions);
  console.log('> Start `take-snapshots` batch');
  var result = {
    processed: 0,
    created: 0,
    error: 0,
    stars: 0
  };

  //STEP 1: grab all projects
  var f1 = function(callback) {
    getProjects({
      Project: options.models.Project,
      project: options.project
    },
      (projects) =>  callback(null, projects) );
  };

  //STEP 2: take the snapshot for every project (if it has been already taken today)
  var processProject = function(project, cb) {
    result.processed++;
    takeOneSnapshot(project, {Snapshot: options.models.Snapshot}, function (err, stars) {
      if (err) {
        result.error++;
        return cb(new Error(`Unable to process ${project.toString()} ${err.message}`));
      }
      if (stars === 0) {
        console.log(`Snapshot already taken ${project.toString()}`);
      }
      if (stars > 0) result.created++;
      result.stars = result.stars + stars;
      cb(null, stars);
    });
  };

  var f2 = function(projects, callback) {
    processAllProjects(
      projects,
      processProject,
      null,
      () => callback(null, result) );
  };

  return waterfall([f1, f2], done);
};

module.exports = start;
