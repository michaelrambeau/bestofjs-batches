request = require 'request'
async = require 'async'

ProjectBatch = require './../ProjectBatch'
github = require '../github'

class CreateSnapshots extends ProjectBatch
  constructor: (keystone) ->
    super('Create snaphots', keystone)

  processProject: (project, cb) ->
    @stats.processed++
    #callback called after existing snapshot is deleted
    create = (project, cb) =>
      @createSnapshot project, cb

    #console.log 'Get last snapshot...', project.name
    @getLastSnapshot project, (err, docs) =>
      if docs.length > 0
        console.log docs.length, 'snapshots to delete...', project.name
        async.each docs, @deleteSnapshot.bind(this), () =>
          create project, cb
      else
        #console.log 'No snapshot found.', project.name
        create project, cb

  createSnapshot: (project, cb) ->
    #console.log 'Creating a snapshot for', project
    @getStars project, (err, githubData) =>
      if err
        console.log err
        @stats.error++
        @track
          msg: 'Error from Github repository'
          repository: project.repository
        cb()
      else
        data =
          project: project._id
          stars: githubData.stars
          createdAt: new Date()
        #console.log 'Creating snapshot...', project.name, githubData
        if @debug is false
          @Snapshot.create data, (err, result) =>
            if err then throw err
            @stats.created++
            console.log 'Snapshot created!', project.toString(), data.stars
            cb()

  #check if an existing snapshot has to be destroyed
  deleteSnapshot: (doc, cb) ->
    today = new Date()
    delta = (today - doc.createdAt) / 1000 / 3600
    if delta < 12
      console.log 'Destroying...', doc.id
      doc.remove (err) =>
        if err
          cb err
        else
          console.log 'destroyed!'
          @stats.deleted++
          cb(null, true)
    else
      cb()

  getLastSnapshot: (project, cb) ->
    @Snapshot.find()
      .where
        project: project.id
      .exec (err, docs) ->
        if err then throw err
        #console.log 'snapshot found for', project.name, docs.length
        cb err, docs


  getStars: (project, cb) ->
    github.getRepoData project, (err, json) =>
      if err
        @track
          msg: 'Error from Github repository'
          repository: project.repository
        cb err
      else
        cb null,
          stars: json.stargazers_count
          last_pushed: json.pushed_at

  postProcess: () ->
    @sendEmail()

module.exports = CreateSnapshots
