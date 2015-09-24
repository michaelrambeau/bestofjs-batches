// batch test
var _ = require('lodash');
var async = require('async');
var waterfall = async.waterfall;

var {processAllProjects, getProjects} = require('../helpers/projects');

var start = function(batchOptions, done) {
  var defaultOptions = null;
  var options = _.defaults(batchOptions, defaultOptions);
  console.log('Start `batch-test`');
  var result = {
    processed: 0
  };

  var f1 = function(callback) {
    getProjects({
      Project: options.models.Project,
      project: options.project
    },
      (projects) =>  callback(null, projects) );
  };

  var processProject = function(project, cb) {
    console.log('Processing', project.toString());
    result.processed++;
    return cb();
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
