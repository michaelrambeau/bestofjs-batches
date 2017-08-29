const moment = require('moment-timezone')
const { get } = require('lodash')

function dateToString(date) {
  return moment(date).tz('Japan').format('YYYYMMDD')
}

function isSameDay(dateA, dateB) {
  return dateToString(dateA) === dateToString(dateB)
}

function updateDailyTrendsIfNeeded(project, previousSnapshot, options) {
  const { logger } = options
  if (!previousSnapshot) return null // No `trends` object to create if there is no snapshot
  const updatedAt = get(project, 'trends.updatedAt')
  const snapshotDate = previousSnapshot.createdAt
  if (isSameDay(updatedAt, snapshotDate)) {
    logger.debug('`trends.daily` already up-to-date')
    return project.trends
  }
  const stars = {
    now: project.github.stargazers_count,
    before: previousSnapshot.stars
  }
  logger.debug('Updating `trends.daily`', stars)
  return updateDailyTrends(project, stars)
}

function updateDailyTrends(project, stars) {
  const deltas = get(project, 'trends.daily') || []
  const trends = {
    updatedAt: new Date(),
    daily: updateDeltas(deltas, stars)
  }
  return trends
}

function updateDeltas(deltas, stars) {
  const firstDelta = stars.now - stars.before
  return [firstDelta].concat(deltas).slice(0, 400)
}

module.exports = {
  dateToString,
  isSameDay,
  updateDailyTrendsIfNeeded,
  updateDailyTrends
}
