const moment = require('moment')

const months = [0, 1, 2, 3, 6, 9, 12]

function getTrends (snapshots, { startDate } = {}) {
  const dates = months.map(m => moment(startDate).subtract(m, 'months').toDate())
  const stars = dates.map(date => {
    const found = snapshots.find(snapshot => snapshot.createdAt < date)
    return found ? found.stars : -1
  })
  stars.reverse()
  return stars.filter(total => total !== -1)
}

module.exports = getTrends
