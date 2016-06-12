const mongoose = require('mongoose')
const minimist = require('minimist')
require('dotenv').load()
mongoose.Promise = require('bluebird')

// Batch functions
const batchTest = require('./batch-test')
const buildData = require('./build-data')
const updateGithubData = require('./update-github-data')
const migrateTags = require('./migrate-tags')
const updateHoF = require('./hof')
const initNpm = require('./init-npm')

const options = {}

// Check command line arguments
const argv = minimist(process.argv.slice(2))

// First argument of the command line: batch key (`github` for example)
const key = argv._[0]

// Optional arguments:
// --project <id>
// --db <key>
// --limit <number>
// --debugmode
// --readonly
if (argv.project) {
  options.project = {_id: argv.project}
  options.debug = true
}
if (argv.debugmode) {
  options.debug = true
  console.log('DEBUG mode enabled')
}
if (argv.readonly) {
  options.readonly = true
  console.log('READONLY mode: no database write operation')
}
if (argv.limit) {
  options.limit = argv.limit
  console.log(`Project loop limited to ${options.limit} projects.`)
}

var mongo_key = 'MONGO_URI'
if (argv.db) {
  mongo_key = 'MONGO_URI_' + argv.db.toUpperCase()
  console.log('Will connect to', mongo_key)
}

const mongo_uri = process.env[mongo_key]
if (!mongo_uri) throw new Error(`"${mongo_key}" env. constiable is not defined.`)
console.log('Connecting to', mongo_uri)
mongoose.connect(mongo_uri)

// Load Mongoose models
const Project = require('../models/Project')
const Snapshot = require('../models/Snapshot')
const Tag = require('../models/Tag')
const Hero = require('../models/Hero')

// Connect to the database and launch the batch when it is OK.
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
  console.log(`Db connection open, start the batch "${key}"` + (options.debug ? ' in DEBUG MODE' : ''))
  const models = {Project, Snapshot, Tag, Hero}
  if (options.readonly) {
    setReadonly(Project)
    setReadonly(Snapshot)
  }
  options.models = models
  start(key, options)
})

function start (key, options) {
  switch (key) {
    case 'test':
      batchTest(options, function (err, result) {
        end(err, result)
      })
      break
    case 'github':
      // Daily batch part 1: update github data and create snapshots
      updateGithubData(options, function (err, result) {
        end(err, result)
      })
      break
    case 'hof':
      updateHoF(options, function (err, result) {
        end(err, result)
      })
      break
    case 'build':
      // Batch batch part 2: build static data
      buildData(options, function (err, result) {
        end(err, result)
      })
      break
    case 'daily':
      // The daily batch
      updateGithubData(options, function (err, result) {
        if (err) return console.log('Unexpected error during part 1', err)
        console.log(result)
        buildData(options, function (err, result) {
          if (err) return console.log('Unexpected error during part 2', err)
          end(err, result)
        })
      })
      break
    case 'migrate-tags':
      migrateTags(options, function (err, result) {
        end(err, result)
      })
      break
    case 'init-npm':
      initNpm(options, function (err, result) {
        end(err, result)
      })
      break
    default:
      console.log('Specify a valid batch key as the 1st command line argument.')
      end()
  }
}

// Disable model write instructions.
function setReadonly (Model) {
  Model.schema.pre('save', function (next) {
    const err = new Error('save() method disabled in READONLY mode')
    next(err)
  })
  Model.schema.pre('create', function (next) {
    const err = new Error('create() method disabled in READONLY mode')
    next(err)
  })
}

function end (err, result) {
  mongoose.disconnect()
  if (err) return console.log('--- THE END with an error ---', err)
  console.log('--- END ---', result)
}
