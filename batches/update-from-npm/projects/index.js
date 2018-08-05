/*
Daily script to update all projects from data related to npm
Launched by the command: `node batches update-npm-projects`
*/
const updateProject = require('./update-project-npm')
const { processAllProjects, getProjects } = require('../../helpers/projects')

async function start(options) {
  const { logger } = options
  const defaultSearchOptions = {
    deprecated: { $ne: true },
    disabled: { $ne: true },
    'npm.name': { $ne: '' }
    // 'bundle.name': { $exists: false }
  }
  const searchOptions = Object.assign({}, defaultSearchOptions, options.project)
  const projects = await getProjects(
    Object.assign({}, options, {
      Project: options.models.Project,
      project: searchOptions
    })
  )
  return await processAllProjects(projects, updateProject(options), {
    logger,
    concurrency: 5
  })
}

module.exports = start
