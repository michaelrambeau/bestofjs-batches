var _ = require('lodash');
var async = require('async');

// INPUT:
// projects: an array of projects
// processProject: function to be applied on each project
// OUTPUT callback function
var processAllProjects = function(projects, processProject, batchOptions, cb) {
  var defaultOptions, limit, options, t0;
  t0 = new Date();
  defaultOptions = {
    parallelLimit: 10
  };
  options = _.extend(defaultOptions, batchOptions);
  limit = options.parallelLimit;
  console.log(projects.length, 'project(s) to process... async limit=', limit);
  async.eachLimit(projects, limit, processProject, function(err) {
    if (err) console.error('Error', err);
    var duration = (new Date() - t0) / 1000;
    console.log('End of the project loop', duration);
    return cb();
  });
};

var getProjects = function(options, cb) {
  return options.Project.find(options.project).sort({
    createdAt: 1
  }).exec(function(err, projects) {
    if (err) {
      throw err;
    }
    return cb(projects);
  });
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

    //use .pluck to select ids only if populate() is used when making a find() request
    tags: project.tags//_.pluck(project.tags, 'id')
  };
  return data;
}

module.exports = {
  processAllProjects,
  getProjects,
  createSuperproject
};
