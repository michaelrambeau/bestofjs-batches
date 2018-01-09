const moment = require('moment')
const { groupBy, flatten, times } = require('lodash')

const months = times(13)

function dateToString(date) {
  return moment(date)
    .tz('Japan')
    .format('YYYYMM')
}

function getMonthlySnapshots(snapshots, { year, month }) {
  const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0)
  const dates = months.map(m =>
    moment(startDate)
      .subtract(m, 'months')
      .toDate()
  )
  const snapshotsByMonth = groupBy(
    snapshots.map(snapshot => ({
      stars: snapshot.stars,
      key: dateToString(snapshot.createdAt)
    })),
    snapshot => snapshot.key
  )
  const onlyOneByMonth = flatten(
    Object.values(snapshotsByMonth).map(oneMonthSnapshots =>
      oneMonthSnapshots.slice(0, 1)
    )
  )
  const stars = dates.map(date => {
    const key = moment(date).format('YYYYMM')
    const found = onlyOneByMonth.find(snapshot => snapshot.key === key)
    return found
      ? {
          stars: found.stars,
          year: date.getFullYear(),
          month: date.getMonth() + 1
        }
      : { found: false }
  })
  // console.log('Stars', stars)
  return stars.filter(item => item.found !== false)
}

function getMonthlyDeltas(snapshots, { year, month }) {
  const monthlySnapshots = getMonthlySnapshots(snapshots, { year, month })
  return monthlySnapshots.slice(0, monthlySnapshots.length - 1).map((item, i) =>
    Object.assign({}, item, {
      delta: item.stars - monthlySnapshots[i + 1].stars
    })
  )
}

module.exports = {
  getMonthlySnapshots,
  getMonthlyDeltas
}
