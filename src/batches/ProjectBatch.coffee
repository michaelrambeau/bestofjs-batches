#Base class extended by every batch

Keen = require 'keen-js'
_ = require 'lodash'
async = require 'async'

Project = require '../models/Project'
Snapshot = require '../models/Snapshot'
Tag = require '../models/Tag'

class ProjectBatch

  constructor: (@title = 'ProjectBatch skeleton', @mongoose) ->
    console.log "---- New batch #{@title} ----"
    @initTracker()
    @stats =
      created: 0
      updated: 0
      deleted: 0
      error: 0
      processed: 0

  initKeystone: (cb) ->
    @Project = Project
    @Snapshot = Snapshot
    #@SuperProject = @keystone.list('Superproject').model

    @debug = false

    @init () =>
      @startLoop () =>
        cb()


  initTracker: () ->
    @keen = new Keen
      projectId: process.env.KEEN_ID
      writeKey: process.env.KEEN_KEY

  track: (data) ->
    @keen.addEvent @title, data, (err, res) ->
      if err then console.log 'Unable to track event', err

  #To be overriden: custom async. initialization
  init: (cb) ->
    cb()

  start: (options, cb) ->
    defaultOptions =
      debug: false
      project: {}
      parallelLimit: 10
    @options = _.extend defaultOptions, options
    console.log 'Batch options', @options
    @initKeystone () =>
      @postProcess()
      cb @stats

  #start the batch!
  startLoop: (cb) ->
    t0 = new Date()
    console.log "--- start the batch ----"
    @track
      msg: 'Start!'
    @getItems (projects) =>
      # Tasks run in parallel but we have to limit the number to avoid memory failures
      # A limit of 2 makes the whole process very slow (92s for 220 projects)
      # A limit of 10 seems to be good (11 seconds), 20 does not really make a difference.
      limit = @options.parallelLimit;
      console.log projects.length, 'projects to process... Async limit=', limit
      async.eachLimit projects, limit, @processProject.bind(this), () =>
        @stats.duration = (new Date() - t0) / 1000
        console.log '--- end! ---', @stats
        @track
          msg: 'End'
          stats: @stats
        cb()

  # Look for items to loop through (by default: projects items)
  # can be overriden to loop through an other model.
  getItems: (cb) ->
    @Project.find(@options.project)
      .populate('tags')
      .populate('snapshots')
      .sort({createdAt: 1})
      .exec (err, projects) =>
        if err then throw err
        cb (projects)

  #Method to be over-riden by child classes
  processProject: (project, cb) ->
    console.log 'Procesing', project.toString()
    @stats.processed++
    cb()

  # Method to lauch AFTER projects have been processed
  # To be overriden
  # Example: call @sendEmail to send an email to admins.
  postProcess: () ->
    #@sendEmail()

  sendEmail: () ->
    # Using "Monkeypath" technique because I could not find a way to solve the error
    # `Keystone has not been configured for email support. Set the `emails` option in your configuration.`
    # keystone.js setting `'emails': 'templates/emails'` was not enough :(
    @keystone.Email.getEmailsPath = () ->
      'templates/emails'
    email = new @keystone.Email('batch')

    # 1. Return an array of email addresses
    getAdminEmail = (cb) =>
      model = @keystone.list('User').model
      model.find({isAdmin: true}).exec (err, docs) ->
        if err
          console.log 'Unable to get Admin users'
          cb err
        else
          cb null, _.pluck(docs, 'email')

    # 2. Send an email to the given recipients
    sentReportTo = (recipients) =>
      data =
        subject: @title
        to: recipients
        fromName: 'Bestofjs batch'
        fromEmail: 'batch@bestojs.org'
        stats: @stats
      console.log 'Sending the email...'
      email.send data, (err, info) ->
        if err
          console.log 'Unable to send the email :(', err
          return
        console.log 'Email sent', info

    # Call functions 1 and 2
    getAdminEmail (err, emails) ->
      if err then return
      console.log 'Email addresses', emails
      sentReportTo emails

module.exports = ProjectBatch
