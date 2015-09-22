# Create "Report" records, used to save the number of Github stars.
# and the evolution over the last days.
# One report by project.
# All existing records are first deleted.
# The batch only scans project snapshots but does not access Github data directly.

moment = require 'moment'
_ = require 'underscore'

ProjectBatch = require './../ProjectBatch'

class CreateSuperProjects extends ProjectBatch
  constructor: (keystone) ->
    super('Create superProjects', keystone)

  processProject: (project, cb) ->
    @stats.processed++
    @getReportData project, (report) =>
      #console.log 'report', report
      data =
        _id: project._id
        stars: report.stars[0]
        createdAt: project.createdAt
        delta1: if report.stars.length > 2 then report.stars[0] - report.stars[1] else 0
        snapshots: report.stars
        deltas: @getDeltas report.stars
        name: project.name
        url: if project.url then project.url else ''
        repository: project.repository
        description: if project.description then project.description else ''
        tags: _.pluck project.tags, 'id'
      console.log data
      @SuperProject.findOne()
        .where
          _id: project._id
        .exec (err, doc) =>
          if err then throw error
          if doc
            #console.log 'Updating...', data
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
              #console.log 'Report created!', project.toString()
              @stats.created++
              cb err, data

  getReportData: (project, cb) ->
    d = moment().subtract(30, 'days').toDate()
    d.setHours(0, 0, 0, 0);
    steps = [1..14]
    dates = (moment().hours(0).minutes(0).seconds(0).subtract(step, 'days').toDate() for step in steps)
    #console.log dates
    report =
      stars: 0
    @Snapshot.find()
      .where('project').equals(project._id)
      .where('createdAt').gt(d)
      .sort
        createdAt: -1
      .exec (err, docs) =>
        dateIndex = 0
        #console.log docs
        for doc, i in docs
          if i is 0 then report.stars = [doc.stars]
          createdAt = doc.createdAt.setHours(0, 0, 0, 0)
          if doc.createdAt <= dates[dateIndex]
            dateIndex++
            #console.log doc.stars
            report.stars.push doc.stars
        cb(report)

  getDeltas: (starArray) ->
    deltas = []
    for stars, i in starArray
      if i isnt starArray.length - 1
        deltas.push stars - starArray[i + 1]
    deltas

module.exports = CreateSuperProjects
