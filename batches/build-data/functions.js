const moment = require('moment')

const days = [1, 7, 30, 90]

function createTrends (snapshots) {
  const points = createAllPoints(snapshots)
  const trends = pointsToTrends(points)
  return trends
}

function pointsToTrends (points) {
  if (points.length === 0) return []
  const stars0 = points[0].stars
  var timesIndex = 0
  const trends = []
  points.forEach(point => {
    if (point.t >= days[timesIndex]) {
      trends.push(stars0 - point.stars)
      timesIndex++
    }
  })
  return trends
}

function createDailyDeltas (snapshots) {
  const points = createAllPoints(snapshots)
  const deltas = pointsToDeltas(points)
  return deltas
}

function createAllPoints (snapshots) {
  const points = snapshots.map(function (doc) {
    return createPoint(doc)
  })
  return points.sort(function (a, b) {
    return a.t - b.t
  })
}

function createPoint (snapshot) {
  var point, snapshotDate
  snapshotDate = new Date(snapshot.createdAt)
  point = {
    stars: snapshot.stars,
    t: getTimeValue(snapshotDate)
  }
  return point
}

function dateOnly (d) {
  d.setHours(d.getHours() + 9, 0, 0, 0)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

function getTimeValue (date) {
  var d, delta, moment0, moment1, today
  d = dateOnly(date)
  today = dateOnly(new Date())
  moment0 = moment(today)
  moment1 = moment(d)
  delta = moment0.diff(moment1, 'days')
  return delta
}

function pointsToDeltas (points) {
  var deltas, reducer
  deltas = []
  reducer = function (pointA, pointB) {
    if (pointA.t > -1) {
      deltas.push(pointA.stars - pointB.stars)
    }
    return pointB
  }
  points.reduce(reducer, {
    t: -1
  })
  return deltas
}

module.exports = {
  days,
  createPoint,
  pointsToDeltas,
  createAllPoints,
  dateOnly,
  getTimeValue,
  createDailyDeltas,
  createTrends,
  pointsToTrends
}
