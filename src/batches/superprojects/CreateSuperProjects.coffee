# Create "Report" records, used to save the number of Github stars.
# and the evolution over the last days.
# One report by project.
# All existing records are first deleted.
# The batch only scans project snapshots but does not access Github data directly.

fs = require 'fs'
moment = require 'moment'
_ = require 'lodash'
{createDailyDeltas} = require './functions'

ProjectBatch = require './../ProjectBatch'

class CreateSuperProjects extends ProjectBatch
  constructor: (keystone) ->
    super('Create superProjects', keystone)
    @writer = fs.createWriteStream('./build/projects.json')
    @json = []

  processProject: (project, cb) ->
    @stats.processed++
    @getSnapshotData project, (report) =>
      data =
        _id: project._id
        stars: report.stars
        createdAt: project.createdAt
        delta1: if report.deltas.length > 0 then report.deltas[0] else 0
        deltas:report.deltas.slice(0, 10)
        name: project.name
        url: if project.url then project.url else ''
        repository: project.repository
        description: if project.description then project.description else ''
        tags: _.pluck project.tags, 'id'
      @json.push data
      cb()
      return
      @SuperProject.findOne()
        .where
          _id: project._id
        .exec (err, doc) =>
          if err then throw error
          if doc
            newDoc = _.extend doc, data
            # I use doc.save rather than model.update because update does not save new fields added to the document!
            newDoc.save (err, result) =>
              if err then throw err
              console.log 'Report updated.', project.toString()
              @stats.updated++
              cb err, data
          else
            console.log 'Creating superproject...', project
            @SuperProject.create data, (err, result) =>
              if err then throw err
              @stats.created++
              cb err, data

  # Return an object with 2 properties
  # - stars: current number of stars
  # - deltas: daily star variations
  getSnapshotData: (project, cb) ->
    d = moment().subtract(30, 'days').toDate()
    d.setHours(0, 0, 0, 0);
    report =
      stars: 0
    console.log 'Searching',  project._id
    @Snapshot.find()
      .where('project').equals(project._id)
      .where('createdAt').gt(d)
      .sort
        createdAt: -1
      .exec (err, docs) =>
        console.log 'Found', docs.length
        deltas = createDailyDeltas docs
        report =
          deltas: deltas
          stars: if docs.length > 0 then docs[0].stars else 0
        cb(report)

  postProcess: () ->
    @writer.write JSON.stringify(@json)
    @writer.end()

module.exports = CreateSuperProjects
