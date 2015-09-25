var github = require('../helpers/github.coffee');
var {dateOnly} = require('../build-data/functions.coffee');
var mongoose = require('mongoose');

var getStars = function(project, options, cb) {
  return github.getRepoData(project, function(err, json) {
    if (err) {
      if (options.track) options.track({
        msg: 'Error from Github repository',
        repository: project.repository
      });
      return cb(err);
    } else {
      return cb(null, {
        stars: json.stargazers_count,
        last_pushed: json.pushed_at
      });
    }
  });
};

var createSnapshot = function(project, options, cb) {
  getStars(project, options, function(err, githubData) {
    if (err) {
      console.log(err);
      if (options.track) options.track({
        msg: 'Error from Github repository',
        repository: project.repository
      });
      return cb(err);
    } else {
      var data = {
        project: project._id,
        stars: githubData.stars,
        createdAt: new Date()
      };
      options.Snapshot.create(data, function(err, result) {
        if (err) throw err;
        console.log('Snapshot created!', project.toString(), data.stars);
        return cb(null, result);
      });
    }
  });
};

// INPUT:
// - project
// - options.Snapshot: Mongoose model
// OUTPUT: the last snapshot record created in the database
var getLastSnapshot = function(project, options, cb) {
  console.log('Searching', project);
  options.Snapshot.findOne({'project': mongoose.Types.ObjectId(project._id)})
    .sort({
      createdAt: -1
    })
    .exec(function(err, doc) {
      if (err) return cb(err);
      console.log('Last snapshot', doc);
      return cb(null, doc);
    });
};

// INPUT: a snapshot record
// OUTPUT: true if the snapshot is today's snapshot
function isTodaySnapshot(snapshot) {
  var d0 = dateOnly(new Date());
  var d1 = dateOnly(snapshot.createdAt);
  return(
    d1.getDay() === d0.getDay() &&
    d1.getMonth() === d0.getMonth() &&
    d1.getFullYear() === d0.getFullYear()
  );
}

module.exports = {
  getStars,
  createSnapshot,
  getLastSnapshot,
  isTodaySnapshot
};
