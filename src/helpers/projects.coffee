_ = require 'lodash'

# INPUT:
# projects: an array of projects
# processProject: function to be applied on each project
# OUTPUT callback function

processAllProjects = (projects, processProject, batchOptions, cb) ->
  t0 = new Date()
  defaultOptions =
    limit: 10
  options = _.extend(defaultOptions, batchOptions)
  console.log "--- start the project loop ----"
  limit = options.parallelLimit;
  console.log projects.length, 'projects to process... Async limit=', limit
  async.eachLimit projects, limit, processProject, () =>
    duration = (new Date() - t0) / 1000
    console.log '--- end! ---', duration
    cb()

# Look for items to loop through (by default: projects items)
# can be overriden to loop through an other model.
getProjects: (Project, options, cb) ->
  Project.find(options.project)
    .populate('tags')
    .populate('snapshots')
    .sort({createdAt: 1})
    .exec (err, projects) =>
      if err then throw err
      cb (projects)

module.exports = processAllProjects
