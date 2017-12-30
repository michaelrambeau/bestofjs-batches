const Promise = require('bluebird')
const { pluck } = require('lodash')
const prettyMs = require('pretty-ms')

// INPUT:
// projects: an array of projects
// processProject: function to be applied on each project
// OUTPUT callback function
async function processAllProjects(projects, processProject, batchOptions) {
  const t0 = new Date()
  const defaultOptions = {
    concurrency: 20
  }
  const options = Object.assign({}, defaultOptions, batchOptions)
  const logger = options.logger
  const concurrency = options.concurrency
  logger.info(
    projects.length,
    'project(s) to process... concurrency=',
    concurrency
  )
  const safeProcessProject = project => {
    return processProject(project, options)
      .then(result => ({
        data: result.data,
        meta: Object.assign({}, result.meta, {
          processed: true,
          error: false
        })
      }))
      .catch(err => {
        logger.error('Unable to process', project.toString(), err.stack)
        return Promise.resolve({
          data: null,
          meta: {
            processed: true,
            error: true
          }
        })
      })
  }
  const result = await Promise.map(projects, safeProcessProject, {
    concurrency
  }).reduce(
    (acc, val) => {
      const meta = Object.keys(val.meta)
        .filter(key => !!val.meta[key])
        .reduce(metaReducer, acc.meta)
      return Object.assign({}, acc, {
        data: acc.data.concat(val.data),
        meta
      })
    },
    { meta: {}, data: [] }
  )
  const duration = new Date() - t0
  logger.info('End of the project loop', prettyMs(duration))
  return result
}

const metaReducer = (acc, val) =>
  Object.assign({}, acc, {
    [val]: acc[val] ? acc[val] + 1 : 1
  })

function getProjects(options) {
  const { logger } = options
  logger.debug('Searching', options.project)
  return options.Project
    .find(options.project)
    .populate('tags')
    .sort({
      createdAt: 1
    })
    .limit(options.limit)
}

const getProjectHomepage = project => {
  const homepage = project.github.homepage
  // npm package page is not a valid homepage!
  const isValid = url => !/npmjs\.com/.test(url) && !/npm\.im/.test(url)
  return homepage && isValid(homepage) ? homepage : project.url
}

// Return the JSON object to save later in the filesystem
function createSuperproject(project, report) {
  var data = {
    name: project.name, // Project name entered in the application (not the one from Github)
    stars: report.stars,
    deltas: report.deltas.slice(0, 7),
    monthly: report.monthlyTrends,
    url: getProjectHomepage(project),
    full_name: project.github.full_name, // 'strongloop/express' for example.
    description: project.github.description
      ? project.github.description
      : project.description,
    pushed_at: project.github.pushed_at,
    owner_id: project.github.owner_id,
    // The Github topics are coming soon!
    // topics: project.github.topics
    //   .filter(topic => topic !== 'javascript'),
    tags: _.pluck(project.tags, 'code'),
    contributor_count: project.github.contributor_count
  }

  // Add Github default branch only if it's different from `master`
  const branch = project.github.branch
  if (branch && branch !== 'master') {
    data.branch = branch
  }

  // Add npm data if available
  if (project.npm && project.npm.name) {
    data.npm = project.npm.name
    data.version = project.npm.version
    data.dependency_count = project.npm.dependencies.length
  }

  // Project custom URL (will be displayed instead of Github owner's avatar)
  if (project.icon && project.icon.url) {
    data.icon = project.icon.url
  }

  return data
}

module.exports = {
  processAllProjects,
  getProjects,
  createSuperproject
}
