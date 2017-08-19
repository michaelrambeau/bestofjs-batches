// batch test
const helpers = require('../helpers/projects')
const processAllProjects = helpers.processAllProjects
const getProjects = helpers.getProjects

async function start(options) {
  const logger = options.logger
  logger.info('Start `batch-test`')
  const processProject = function(project) {
    logger.verbose('Processing', project.toString())
    return Promise.resolve({ meta: { success: true } })
  }
  const projects = await getProjects(
    Object.assign({}, options, {
      Project: options.models.Project
    })
  )
  const result = await processAllProjects(projects, processProject, {
    logger
  })
  return result
}

module.exports = start
