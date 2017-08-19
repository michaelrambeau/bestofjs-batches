var github = require('../helpers/github')
var dateOnly = require('../build-data/functions').dateOnly
var mongoose = require('mongoose')

// INPUT: project
// OUTPUT: Github repository data
function getStars(project) {
  return github.getRepoData(project).then(json => ({
    stars: json.stargazers_count,
    last_pushed: json.pushed_at
  }))
}

// Creates a snapshot record in the database.
// INPUT:
// - project
// - options.Snapshot: Mongoose model used to create data
// OUTPUT: created record
async function createSnapshot(project, options) {
  const githubData = await getStars(project, options)
  const data = {
    project: project._id,
    stars: githubData.stars,
    createdAt: new Date()
  }
  const result = await options.Snapshot.create(data)
  console.log('Snapshot created!', project.toString(), data.stars) // eslint-disable-line no-console
  return result
}

// INPUT:
// - project
// - options.Snapshot: Mongoose model
// OUTPUT: the last snapshot record created in the database
function getLastSnapshot(project, options) {
  if (!options.Snapshot)
    throw new Error('No Snapshot model passed to getLastSnapshot()')
  return options.Snapshot
    .findOne({ project: mongoose.Types.ObjectId(project._id) })
    .sort({
      createdAt: -1
    })
  // .then(doc => doc.toObject())
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
async function takeOneSnapshot(project, options) {
  const snapshot = await getLastSnapshot(project, options)
  if (snapshot && isTodaySnapshot(snapshot)) {
    // No snapshot to take, a snapshot has already been taken today!
    return 0
  }
  const newSnapshot = await createSnapshot(project, options)
  return newSnapshot.stars
}

module.exports = {
  getStars,
  createSnapshot,
  getLastSnapshot,
  isTodaySnapshot,
  takeOneSnapshot
}
