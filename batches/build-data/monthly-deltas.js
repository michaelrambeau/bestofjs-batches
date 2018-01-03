const moment = require('moment')
const { times } = require('lodash')

const months = times(13)

function getMonthlySnapshots(snapshots, { year, month }) {
  const startDate = new Date(year, month - 1, 1, 10, 0, 0, 0)
  const dates = months.map(m =>
    moment(startDate)
      .subtract(m, 'months')
      .toDate()
  )
  const stars = dates.map(date => {
    const found = snapshots.find(snapshot => snapshot.createdAt < date)
    return found
      ? {
          stars: found.stars,
          year: found.createdAt.getFullYear(),
          month: found.createdAt.getMonth() + 1
        }
      : { found: false }
  })
  return stars.filter(item => item.found !== false)
}

function getMonthlyDeltas(snapshots, { year, month }) {
  const monthlySnapshots = getMonthlySnapshots(snapshots, { year, month })
  return monthlySnapshots.slice(1).map((item, i) =>
    Object.assign({}, item, {
      delta: monthlySnapshots[i].stars - item.stars
    })
  )
}

module.exports = {
  getMonthlySnapshots,
  getMonthlyDeltas
}
