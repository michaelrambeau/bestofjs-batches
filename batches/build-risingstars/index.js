const path = require('path')
const fs = require('fs-extra')

const isIncluded = require('./is-included')
const helpers = require('../helpers/projects')
const { processAllProjects, getProjects } = helpers
const processProject = require('./process-project')

const year = 2017

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
      year,
      Snapshot: options.models.Snapshot,
      debug: options.debug,
      logger
    }),
    {
      logger
    }
  )
  const json = createFinalJSON(result.data)
  await save(json, 'projects.json')
  return result
}

function createFinalJSON(results) {
  const projects = results.filter(item => !!item).filter(isIncluded) // limit to projects that got more than 1K stars
  return {
    date: new Date(),
    count: projects.length,
    projects
  }
}

function save(json, filename) {
  const filepath = path.join(process.cwd(), 'build', year.toString(), filename)
  return fs.outputJson(filepath, json)
}

module.exports = start
