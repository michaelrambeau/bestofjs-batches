const helpers = require('../helpers/projects')
const { processAllProjects, getProjects } = helpers
const processProject = require('./process-project')

async function start(options) {
  const { logger } = options
  const defaultSearchOptions = {
    disabled: { $ne: true },
    deprecated: { $ne: true }
  }
  const searchOptions = Object.assign({}, defaultSearchOptions, options.project)
  const projects = await getProjects(
    Object.assign({}, options, {
      Project: options.models.Project,
      project: searchOptions
    })
  )
  const result = await processAllProjects(
    projects,
    processProject({
      Snapshot: options.models.Snapshot,
      debug: options.debug,
      logger
    }),
    {
      logger
    }
  )
  return result
}

module.exports = start
