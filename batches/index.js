// Read secrets from `.env` file in local development mode
require('dotenv').config({ silent: true })

const mongoose = require('mongoose')
const minimist = require('minimist')
const getOptions = require('./getOptions')
mongoose.Promise = require('bluebird')

// Batch functions
const batchTest = require('./batch-test')
const buildData = require('./build-data')
const updateGithubData = require('./update-github-data')
const updateNpmData = require('./update-npm-data')
const updateHoF = require('./hof')
const dailyDatabaseProcess = require('./daily-database-process')
const initTrends = require('./trends')

const argv = minimist(process.argv.slice(2))
const options = getOptions(argv)
const logger = options.logger

// First argument of the command line: batch key (`github` for example)
const key = argv._[0]

var mongo_key = 'MONGO_URI'
if (argv.db) {
  mongo_key = 'MONGO_URI_' + argv.db.toUpperCase()
  logger.info('Will connect to', mongo_key)
}

const mongo_uri = process.env[mongo_key]
if (!mongo_uri) throw new Error(`"${mongo_key}" env. variable is not defined.`)
logger.info(
  'Connecting to',
  mongo_uri.replace(/(mongodb:\/\/)(.+):(.+)(@.+)/, '$1***@***$4')
)
mongoose.connect(mongo_uri, { useMongoClient: true })

// Load Mongoose models
const Project = require('../models/Project')
const Snapshot = require('../models/Snapshot')
const Tag = require('../models/Tag')
const Hero = require('../models/Hero')

// Connect to the database and launch the batch when it is OK.
const db = mongoose.connection
db.on('error', err => logger.error(`Db connection error ${err.toString()}`))
db.once('open', async () => {
  try {
    logger.warn(`Db connection open, start the batch "${key}"`)
    const models = { Project, Snapshot, Tag, Hero }
    if (options.readonly) {
      setReadonly(Project)
      setReadonly(Snapshot)
    }
    options.models = models

    logger.profile('batch')
    await startBatch(key, options)
    logger.profile('batch')
    db.close()
  } catch (err) {
    logger.error('Unexpected error!', err.message)
  }
})

const handlers = {
  test: batchTest,
  github: updateGithubData,
  build: buildData,
  hof: updateHoF,
  npm: updateNpmData,
  'daily-database-process': dailyDatabaseProcess,
  trends: initTrends
}

async function startBatch(key, options) {
  try {
    const handler = handlers[key]
    if (!handler) {
      throw new Error(
        'Specify a valid batch key as the 1st command line argument.'
      )
    }
    const result = await handler(options)
    logger.warn('--- THE END ---', result.meta)
  } catch (err) {
    logger.error('--- Termination with an ERROR ---', err.stack)
  }
}

// Disable model write instructions.
function setReadonly(Model) {
  Model.schema.pre('save', function(next) {
    const err = new Error('save() method disabled in READONLY mode')
    next(err)
  })
  Model.schema.pre('create', function(next) {
    const err = new Error('create() method disabled in READONLY mode')
    next(err)
  })
}
