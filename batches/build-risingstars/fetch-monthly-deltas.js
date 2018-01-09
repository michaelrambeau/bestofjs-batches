const moment = require('moment')
const { getMonthlyDeltas } = require('../build-data/monthly-deltas')

async function fetchMonthlyDeltas({ project, Snapshot, year, month, logger }) {
  const endDate = new Date(year, month - 1, 1, 21, 0, 0)
  const startDate = moment(endDate)
    .subtract(1, 'years')
    .subtract(1, 'days')
    .toDate()
  logger.debug('Fetch snapshots', { startDate, endDate })
  const snapshots = await Snapshot.find()
    .where('project')
    .equals(project._id)
    .where('createdAt')
    .gte(startDate)
    .lte(endDate)
    .sort({
      createdAt: 1
    })
    .lean()
  logger.debug('Snapshot found', {
    count: snapshots.length,
    first: snapshots[snapshots.length - 1].createdAt,
    last: snapshots[0].createdAt
  })
  const deltas = getMonthlyDeltas(snapshots, { year, month })
  logger.debug('Deltas found', deltas.map(item => item.delta))
  return deltas
}

module.exports = fetchMonthlyDeltas
