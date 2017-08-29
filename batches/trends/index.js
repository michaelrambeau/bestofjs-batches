// Initialize (or reset) the `trends.daily` array saved in project documents
const helpers = require('../helpers/projects')
const { processAllProjects, getProjects } = helpers
const { getDailyTrends } = require('./snapshot-helpers')

const processProject = options => async project => {
  const { logger } = options
  logger.verbose('Processing', project.toString())
  const dailyTrends = await getDailyTrends({ project, logger })
  logger.verbose(`${dailyTrends.length} trends for ${project.toString()}`, {
    trends: dailyTrends.slice(0, 10)
  })
  project.trends = {
    daily: dailyTrends,
    updatedAt: new Date()
  }
  if (!options.readonly) {
    logger.debug(`Saving ${project.toString()}`)
    await project.save()
  }
  return { meta: { updated: !options.readonly } }
}

async function start(options) {
  const { logger } = options
  const projects = await getProjects(
    Object.assign({}, options, {
      Project: options.models.Project
    })
  )
  const result = await processAllProjects(projects, processProject(options), {
    logger
  })
  return result
}

module.exports = start
