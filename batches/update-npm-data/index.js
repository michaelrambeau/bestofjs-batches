const updateProject = require('./update-project-npm')
const helpers = require('../helpers/projects')
const processAllProjects = helpers.processAllProjects
const getProjects = helpers.getProjects

async function start(options) {
  const { logger } = options
  logger.info('> Start `update-npm-data` batch')
  const defaultSearchOptions = {
    deprecated: { $ne: true },
    'npm.name': { $ne: '' }
  }
  const searchOptions = Object.assign({}, defaultSearchOptions, options.project)
  const projects = await getProjects(
    Object.assign({}, options, {
      Project: options.models.Project,
      project: searchOptions
    })
  )
  return await processAllProjects(projects, updateProject(options), {
    logger
  })
}

module.exports = start
