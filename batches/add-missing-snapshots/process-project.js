const moment = require('moment')
const fetchStars = require('./fetch-stars')
const { groupBy, flatten } = require('lodash')

function dateToString(date) {
  return moment(date)
    .tz('Japan')
    .format('YYYYMMDD')
}

const processProject = ({ Snapshot, debug, logger }) => async project => {
  const results = await fetchStars(project)
  const items = results.starstats.map(([timestamp, stars]) => {
    const date = new Date(timestamp * 1000)
    return {
      date,
      key: dateToString(date),
      stars
    }
  })
  console.log('Fetch results', items)

  const existingSnapshots = await findAllSnapshots({
    project,
    Snapshot
  })
  const existingSnapshotsWithKey = existingSnapshots.map(snapshot =>
    Object.assign({}, snapshot, { key: dateToString(snapshot.createdAt) })
  )
  const existsInCollection = item => {
    const found = existingSnapshotsWithKey.find(
      snapshot => snapshot.key === item.key
    )
    return !!found
  }
  const missingSnapshots = items.filter(item => !existsInCollection(item))
  const byMonth = groupBy(missingSnapshots, item => item.key.slice(0, 6))
  const onlyOneByMonth = flatten(
    Object.values(byMonth).map(oneMonthSnapshots =>
      oneMonthSnapshots.slice(0, 1)
    )
  )
  console.log(
    'Missing Snapshot items',
    missingSnapshots.length,
    missingSnapshots
  )
  console.log('By month', byMonth.length)
  console.log(
    'One by month',
    onlyOneByMonth.length,
    onlyOneByMonth.map(item => item.key)
  )
  const creationResult = await Promise.all(
    onlyOneByMonth.map(item =>
      createSnapshot({ project, Snapshot, date: item.date, stars: item.stars })
    )
  )
  logger.info('Snapshots created', { result: creationResult })
  return { meta: { success: true }, data: results }
}

function findAllSnapshots({ project, Snapshot }) {
  return Snapshot.find()
    .where('project')
    .equals(project._id)
    .sort({
      createdAt: 1
    })
    .lean()
}

function createSnapshot({ project, Snapshot, date, stars }) {
  const data = {
    project: project._id,
    stars,
    createdAt: date,
    insertedAt: new Date()
  }
  return Snapshot.create(data)
}

module.exports = processProject
