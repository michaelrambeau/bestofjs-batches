const moment = require('moment')
const helpers = require('./functions')
const createAllPoints = helpers.createAllPoints
const pointsToTrends = helpers.pointsToTrends
const pointsToDeltas = helpers.pointsToDeltas
const getMonthlyTrends = require('./monthly-trends')

// const startDate = new Date(2017, 0, 1) // used to generate "2016 rising stars"
const startDate = new Date()

// Return an object with 2 properties
// - stars: current number of stars
// - deltas: daily star variations
const getSnapshotData = function (project, options, cb) {
  const { logger } = options
  logger.debug('getSnapshotData', project.name)
  var d = moment().subtract(500, 'days').toDate()
  d.setHours(0, 0, 0, 0)
  options.Snapshot
  .find()
    .where('project').equals(project._id)
    .where('createdAt').gt(d)
    .sort({
      createdAt: -1
    })
    .exec(function (err, docs) {
      if (err) return cb(err)
      const points = createAllPoints(docs)
      const report = {
        deltas: pointsToDeltas(points),
        trends: pointsToTrends(points),
        monthlyTrends: getMonthlyTrends(docs, { startDate }),
        stars: docs.length > 0 ? docs[0].stars : 0
      }
      return cb(null, report)
    })
}
module.exports = getSnapshotData
