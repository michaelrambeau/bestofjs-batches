const _ = require('lodash')
const async = require('async')

// INPUT:
// projects: an array of projects
// processProject: function to be applied on each project
// OUTPUT callback function
function processAllProjects (projects, processProject, batchOptions, cb) {
  const t0 = new Date()
  const defaultOptions = {
    parallelLimit: 20
  }
  const options = _.extend(defaultOptions, batchOptions)
  const logger = options.logger
  const limit = options.parallelLimit
  logger.info(projects.length, 'project(s) to process... async limit=', limit)
  async.eachLimit(projects, limit, processProject, function (err) {
    if (err) logger.error('Error', err)
    const duration = (new Date() - t0) / 1000
    logger.info('End of the project loop', duration)
    return cb()
  })
}

function getProjects (options, cb) {
  const logger = options.logger
  return options.Project.find(options.project)
    .populate('tags')
    .sort({
      createdAt: 1
    })
    .exec(function (err, projects) {
      if (err) {
        throw err
      }
      if (projects.length === 0) logger.error('No project found!', options.project)
      var limit = options.limit
      return cb(limit ? projects.slice(0, limit) : projects)
    })
}

// Return the JSON object to save later in the filesystem
function createSuperproject (project, report) {
  var data = {
    _id: project._id,
    name: project.name, // Project name entered in the application (not the one from Github)
    stars: report.stars,
    deltas: report.deltas.slice(0, 7),
    // trends: report.trends,
    monthly: report.monthlyTrends,
    url: project.github.homepage ? project.github.homepage : '',
    full_name: project.github.full_name, // 'strongloop/express' for example.
    description: project.github.description ? project.github.description : project.description,
    pushed_at: project.github.pushed_at,
    owner_id: project.github.owner_id,
    // use .pluck to select ids only if populate() is used when making a find() request
    // tags: project.tags//_.pluck(project.tags, 'id')
    tags: _.pluck(project.tags, 'code')
  }

  // Add Github default branch only if it's different from `master`
  const branch = project.github.branch
  if (branch && branch !== 'master') {
    data.branch = branch
  }

  // Add npm data if available
  if (project.npm && project.npm.name) {
    data.npm = project.npm.name
    data.quality = project.packagequality.quality || 0
    data.version = project.npm.version
  }

  // Add data from npms.io API
  if (project.npms && project.npms.score) {
    data.score = project.npms.score.final || 0
  }

  if (project.svglogo) {
    data.svglogo = project.svglogo
  }
  if (project.svglogo) {
    data.svglogo = project.svglogo
  }
  if (project.colors && project.colors.vibrant) {
    data.color = project.colors.vibrant.replace(/#/, '')
  }

  return data
}

module.exports = {
  processAllProjects,
  getProjects,
  createSuperproject
}
