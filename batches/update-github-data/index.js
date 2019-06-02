// DAILY BUILD PART 1 (November 2015 version)
// Steps:
// - Loop through all projects
// - Get data from Github API
// - Update project record with Github data
// - Get the last snapshot record saved in the database
// IF it is not today's snapshot =>
//   - save a "snapshot" record in the database

const updateProject = require('./update-project-github')

const createClient = require('../shared/github-api-client')
const helpers = require('../helpers/projects')
const processAllProjects = helpers.processAllProjects
const getProjects = helpers.getProjects

async function start(options) {
  const { logger } = options
  const accessToken = process.env.GITHUB_ACCESS_TOKEN
  const client = createClient(accessToken)
  // STEP 1: grab all projects, excluding "deprecated" projects
  const defaultSearchOptions = {
    deprecated: { $ne: true }
  }
  const searchOptions = Object.assign({}, defaultSearchOptions, options.project)
  const projects = await getProjects(
    Object.assign({}, options, {
      Project: options.models.Project,
      project: searchOptions
    })
  )
  // STEP 2: take the snapshot for every project (if it has been already taken today)
  return await processAllProjects(
    projects,
    updateProject({ ...options, client }),
    {
      logger,
      concurrency: 5
    }
  )
}

module.exports = start
