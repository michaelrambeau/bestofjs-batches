mongoose = require 'mongoose'
require('dotenv').load()

batch2 = require './step2/index.coffee'

mongoose.connect(process.env.MONGO_URI)

Project = require './models/Project'
Snapshot = require './models/Snapshot'
Tag = require './models/Tag'

db = mongoose.connection
db.on 'error', console.error.bind(console, 'connection error:')
db.once 'open', () ->
  console.log 'Connection opened!'

  options =
    Project: Project

  console.log 'start !!!!'
  mongoose.disconnect()
  #batch2 options, (err, result) ->
    #console.log 'batch2 OK', result
