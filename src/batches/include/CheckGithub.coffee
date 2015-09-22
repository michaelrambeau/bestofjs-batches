# Check Github repositories
# Do no create or update any data, useful to check batches

moment = require 'moment'
_ = require 'underscore'

ProjectBatch = require './../ProjectBatch'
github = require '../github'

class CheckGithub extends ProjectBatch
  constructor: (keystone) ->
    super('CheckGithub', keystone)

  processProject: (project, cb) ->
    console.log 'Checking', project.toString()
    @getStars project, (err, data) =>
      #if data then console.log data;
      cb()

  getStars: (project, cb) ->
    github.getRepoData project, (err, json) =>
      if err
        @stats.error++
        @track
          msg: 'Error from Github repository'
          repository: project.repository
          error: err.message
        cb err
      else
        @stats.processed++
        cb null,
          stars: json.stargazers_count
          last_pushed: json.pushed_at

module.exports = CheckGithub
