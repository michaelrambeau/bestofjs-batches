//Batch #2: from snapshots saved in the database, build a JSON file saved in `build` folder
var _ = require('lodash');
var async = require('async');
var waterfall = async.waterfall;

var {processAllProjects, getProjects} = require('../helpers/projects');
var getSnapshotData = require('./get-snapshot-data');
var getTags = require('./get-tags');
var write = require('./save-json');

var start = function(batchOptions, done) {
  var defaultOptions = null;
  var options = _.defaults(batchOptions, defaultOptions);
  console.log('Start `build-data`');
  var result = {
    processed: 0,
    error: 0
  };

  //STEP 1: grab all projects
  var f1 = function(callback) {
    getProjects({
      Project: options.models.Project,
      project: options.project
    },
      (projects) =>  callback(null, projects) );
  };

  //STEP 2: get superprojects
  var superprojects = [];
  var processProject = function(project, cb) {
    result.processed++;
    getSnapshotData(project, {Snapshot: options.models.Snapshot}, function (report) {
      var superproject = createSuperproject(project, report);
      superprojects.push(superproject);
      return cb(null, superproject);
    });
  };

  var f2 = function(projects, callback) {
    processAllProjects(
      projects,
      processProject,
      null,
      () => callback(null, superprojects) );
  };

  //STEP 3: get tags
  var f3 = function (superprojects, callback) {
    getTags({Tag: options.models.Tag}, function (err, tags) {
      if (err) throw err;
      callback(null, {
        projects: superprojects,
        tags
      });
    });
  };

  //Write the JSON file
  var f4 = function (json, cb) {
    write(json, {}, function (err, result) {
      if (err) throw err;
      result.projects = json.projects.length;
      result.tags = json.tags.length;
      result.date = json.date;
      cb(null, result);
    });
  };

  return waterfall([f1, f2, f3, f4], done);
};

//Return the JSON object to save later in the filesystem
function createSuperproject(project, report) {
  var data = {
    _id: project._id,
    stars: report.stars,
    //createdAt: project.createdAt,
    delta1: report.deltas.length > 0 ? report.deltas[0] : 0,
    deltas: report.deltas.slice(0, 10),
    name: project.name,
    url: project.url ? project.url : '',
    repository: project.repository,
    description: project.description ? project.description : '',
    tags: _.pluck(project.tags, 'id')
  };
  return data;
}

module.exports = start;
