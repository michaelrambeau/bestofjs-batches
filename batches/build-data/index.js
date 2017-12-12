// Batch #2: from snapshots saved in the database, build a JSON file saved in `build` folder
const helpers = require('../helpers/projects')
const processAllProjects = helpers.processAllProjects
const getProjects = helpers.getProjects
const createSuperproject = helpers.createSuperproject

const getSnapshotData = require('./get-snapshot-data')
const getTags = require('./get-tags')
const save = require('./save-json')
const buildCompactList = require('./stateofjs/build-stateofjs-list')
const stateofjsList = require('./stateofjs/stateofjs2017.json')

async function start(options) {
  const { logger } = options
  // STEP 1: grab all projects, ignoring "deprecated" and "disabled" projects
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
  // STEP 2: get 'superprojects' (aggregated data used later to create the JSON file consumed by the web app)
  const processProject = async project => {
    const opts = {
      Snapshot: options.models.Snapshot,
      debug: options.debug,
      logger
    }
    const report = await getSnapshotData(project, opts)
    return { data: createSuperproject(project, report) }
  }

  const result = await processAllProjects(projects, processProject, { logger })
  const superprojects = result.data

  const tags = await getTags({ Tag: options.models.Tag })
  // include only projects that have at least one snapshot
  // ( = include only projects created at least 2 days ago)
  const filteredProjects = superprojects
    .filter(item => !!item) // remove null items that might be created if error occurred
    .filter(project => project.deltas.length > 0)
  const json = { date: new Date(), tags, projects: filteredProjects }
  await save(json, 'projects.json')
  const meta = Object.assign({}, result.meta, {
    message: 'JSON file created',
    tags: json.tags.length,
    projects: json.projects.length,
    date: json.date
  })
  const finalResult = { meta }

  // STEP 4
  await buildAndSaveCompactList({ json, logger })
  return finalResult
}

function buildAndSaveCompactList({ json, logger }) {
  const compactJson = buildCompactList({ fullList: json, stateofjsList })
  logger.info('State of JavaScript JSON file created!', {
    count: compactJson.count
  })
  return save(compactJson, 'stateofjs2017.json')
}

module.exports = start
