var _ = require('lodash');
var async = require('async');

var processAllProjects = function(projects, processProject, batchOptions, cb) {
  var defaultOptions, limit, options, t0;
  t0 = new Date();
  defaultOptions = {
    parallelLimit: 10
  };
  options = _.extend(defaultOptions, batchOptions);
  console.log("--- start the project loop ----");
  limit = options.parallelLimit;
  console.log(projects.length, 'projects to process... Async limit=', limit);
  async.eachLimit(projects, limit, processProject, function() {
    var duration;
    duration = (new Date() - t0) / 1000;
    console.log('--- end! ---', duration);
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
