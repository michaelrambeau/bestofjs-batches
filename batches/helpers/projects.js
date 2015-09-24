var _ = require('lodash');
var async = require('async');

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
  return options.Project.find(options.project).populate('tags').populate('snapshots').sort({
    createdAt: 1
  }).exec(function(err, projects) {
    if (err) {
      throw err;
    }
    return cb(projects);
  });
};


module.exports = {
  processAllProjects,
  getProjects
};
