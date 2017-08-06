var github = require('../helpers/github')
var dateOnly = require('../build-data/functions').dateOnly
var mongoose = require('mongoose')

// INPUT: project
// OUTPUT: Github repository data
var getStars = function(project, options, cb) {
  github.getRepoData(project, function(err, json) {
    if (err) {
      if (options.track)
        options.track({
          msg: 'Error from Github repository',
          repository: project.repository
        })
      return cb(err)
    } else {
      cb(null, {
        stars: json.stargazers_count,
        last_pushed: json.pushed_at
      })
    }
  })
}

// Creates a snapshot record in the database.
// INPUT:
// - project
// - options.Snapshot: Mongoose model used to create data
// OUTPUT: created record
var createSnapshot = function(project, options, cb) {
  getStars(project, options, function(err, githubData) {
    if (err) {
      if (options.track)
        options.track({
          msg: 'Error from Github repository',
          repository: project.repository
        })
      return cb(err)
    } else {
      var data = {
        project: project._id,
        stars: githubData.stars,
        createdAt: new Date()
      }
      options.Snapshot.create(data, function(err, result) {
        if (err) throw err
        console.log('Snapshot created!', project.toString(), data.stars)
        return cb(null, result)
      })
    }
  })
}

// INPUT:
// - project
// - options.Snapshot: Mongoose model
// OUTPUT: the last snapshot record created in the database
var getLastSnapshot = function(project, options, cb) {
  if (!options.Snapshot)
    return cb(new Error('No Snapshot model passed to getLastSnapshot()'))
  options.Snapshot
    .findOne({ project: mongoose.Types.ObjectId(project._id) })
    .sort({
      createdAt: -1
    })
    .exec(function(err, doc) {
      if (err) return cb(err)
      return cb(null, doc)
    })
}

// INPUT: a snapshot record
// OUTPUT: true if the snapshot is today's snapshot
function isTodaySnapshot(snapshot) {
  var d0 = dateOnly(new Date())
  var d1 = dateOnly(snapshot.createdAt)
  return (
    d1.getDay() === d0.getDay() &&
    d1.getMonth() === d0.getMonth() &&
    d1.getFullYear() === d0.getFullYear()
  )
}

//Check if there is already a snapshot created today for the given rroject
//and create the snapshot record in the database.
//INPUT: a project record
//OUTPUT: the number of stars of the created snapshot, 0 if the snapshot already exists.
function takeOneSnapshot(project, options, cb) {
  getLastSnapshot(project, options, function(err, snapshot) {
    if (err)
      return cb(
        new Error(
          'An error occured when retrieving the last snapshot.' + err.message
        )
      )
    if (snapshot && isTodaySnapshot(snapshot)) {
      //No snapshot to take, a snapshot has already been taken today!
      cb(null, 0)
    } else {
      createSnapshot(project, options, function(err, snapshot) {
        if (err)
          return cb(
            new Error(
              'An error occured when creating the snapshot.' + err.message
            )
          )
        const stars = snapshot.stars
        cb(null, stars)
      })
    }
  })
}

module.exports = {
  getStars,
  createSnapshot,
  getLastSnapshot,
  isTodaySnapshot,
  takeOneSnapshot
}
