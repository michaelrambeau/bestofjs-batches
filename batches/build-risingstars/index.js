const path = require('path')
const fs = require('fs-extra')

const helpers = require('../helpers/projects')
const { processAllProjects, getProjects, createSuperproject } = helpers
const getYearlyData = require('./get-yearly-delta')
const projectToJSON = require('./project-to-json')

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

  const processProject = async project => {
    const opts = {
      Snapshot: options.models.Snapshot,
      debug: options.debug,
      logger
    }
    const yearlyData = await getYearlyData({ project, options: opts, year })
    if (!yearlyData) throw new Error(`No snapshot data!`)
    const { first, last } = yearlyData
    const report = {
      first,
      last,
      delta: last.stars - first.stars,
      days: parseInt((last.date - first.date) / 1000 / 60 / 60 / 24)
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
  const result = await processAllProjects(projects, processProject, { logger })
  const json = createFinalJSON(result.data)
  await save(json, 'project.json')
  return result
}

function createFinalJSON(results) {
  const projects = results
    .filter(item => !!item)
    .filter(project => project.delta > 600)
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
