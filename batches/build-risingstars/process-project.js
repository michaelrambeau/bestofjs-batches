const getYearlyData = require('./get-yearly-delta')
const fetchMonthlyDeltas = require('./fetch-monthly-deltas')
const projectToJSON = require('./project-to-json')

const processProject = ({ year, Snapshot, debug, logger }) => async project => {
  const opts = {
    Snapshot,
    debug,
    logger
  }
  const yearlyData = await getYearlyData({ project, options: opts, year })
  const { first, last } = yearlyData
  const delta = last.stars - first.stars
  const monthlyDeltas =
    delta > 1000 &&
    (await fetchMonthlyDeltas({
      project,
      year: 2018,
      month: 1,
      Snapshot,
      logger
    }))
  if (!yearlyData) throw new Error('No snapshot data!')
  const report = {
    first,
    last,
    delta,
    days: parseInt((last.date - first.date) / 1000 / 60 / 60 / 24),
    monthly: monthlyDeltas
  }
  logger.debug({
    project: project.name,
    first: report.first,
    delta: report.delta,
    days: report.days
  })
  const updatedProject = projectToJSON({ project, report })
  return {
    meta: { success: true },
    data: updatedProject
  }
}
module.exports = processProject
