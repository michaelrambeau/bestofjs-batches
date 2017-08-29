const Snapshot = require('../../models/Snapshot')

async function getDailyTrends({ project, logger }) {
  const { _id } = project
  const snapshots = await getSnapshots({ _id, logger })
  const trends =
    snapshots.length > 0 ? calculateDailyVariations({ snapshots, logger }) : []
  return trends
}

function getSnapshots({ _id, logger }) {
  logger.debug('Search for snapshots', { _id: _id.toString() })
  const query = { project: _id }
  return Snapshot.find(query)
    .select({ stars: 1, _id: 0, createdAt: 1 })
    .sort('-createdAt')
    .limit(365)
}

function calculateDailyVariations({ snapshots, logger }) {
  logger.debug('Converting snapshots', {
    count: snapshots.length,
    first10: snapshots.slice(0, 10).map(snapshot => snapshot.stars)
  })
  const value0 = snapshots[0].stars
  return snapshots.slice(1).reduce((acc, snapshot) => {
    return {
      deltas: acc.deltas.concat(acc.previous - snapshot.stars),
      previous: snapshot.stars
    }
  }, { deltas: [], previous: value0 }).deltas
}

module.exports = {
  getDailyTrends
}
