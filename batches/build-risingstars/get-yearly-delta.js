const moment = require('moment')
const { get } = require('lodash')

const helpers = require('../build-data/functions')
const createAllPoints = helpers.createAllPoints
const pointsToTrends = helpers.pointsToTrends
const pointsToDeltas = helpers.pointsToDeltas
const getMonthlyTrends = require('../build-data/monthly-trends')

const newProjectSnapshots = require('./snapshots')

// const startDate = new Date(2017, 0, 1) // used to generate "2016 rising stars"
const startDate = new Date()

// Return an object with # 3roperties
// - stars: current number of stars
// - deltas: daily star variations
async function getYearlyDelta({ project, year, options }) {
  const { logger, Snapshot } = options
  logger.debug('getSnapshotData', project.name)
  const queries = [
    getFirstSnapshot({ Snapshot, project, year }),
    getLastSnapshot({ Snapshot, project, year })
  ]
  const [first, last] = await Promise.all(queries)
  if (!first || !last) return null
  return {
    first: { date: first.createdAt, stars: first.stars },
    last: { date: last.createdAt, stars: last.stars }
  }
}

function getNewProjectSnapshot({ project, year }) {
  const path = `year${year}.${project.github.full_name}`
  const snapshot = get(newProjectSnapshots, path)
  return (
    snapshot && {
      stars: snapshot.stars,
      createdAt: new Date(snapshot.createdAt)
    }
  )
}

function getFirstSnapshot({ Snapshot, year, project }) {
  const snapshot = getNewProjectSnapshot({ project, year })
  if (snapshot) return snapshot
  const d = new Date(year, 0, 1)
  return Snapshot.findOne()
    .where('project')
    .equals(project._id)
    .where('createdAt')
    .gte(d)
    .sort({
      createdAt: 1
    })
    .limit(1)
    .lean()
}
function getOldestSnapshot(params) {}

function getLastSnapshot({ Snapshot, year, project }) {
  const d = new Date(year + 1, 0, 1)
  return Snapshot.findOne()
    .where('project')
    .equals(project._id)
    .where('createdAt')
    .lt(d)
    .sort({
      createdAt: -1
    })
    .limit(1)
    .lean()
}
module.exports = getYearlyDelta
