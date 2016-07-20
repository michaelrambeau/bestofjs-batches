const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const createLogger = require('./createLogger')

// Parse command line optional arguments and return an options object
// Optional arguments:
// --project <github shortname>
// --db <key>
// --limit <number>
// --debugmode
// --readonly
// --loglevel
module.exports = function (argv) {
  const loglevel = argv.loglevel
  const logger = createLogger({ level: loglevel })
  const options = { logger }

  if (argv.id) {
    options.project = { _id: ObjectId(argv.id) }
    options.debug = true
  }
  if (argv.project) {
    options.project = { 'github.name': argv.project }
    options.debug = true
  }
  if (argv.debugmode) {
    options.debug = true
    logger.info('DEBUG mode enabled')
  }
  if (argv.readonly) {
    options.readonly = true
    logger.info('READONLY mode: no database write operation')
  }
  if (argv.limit) {
    options.limit = argv.limit
    logger.info(`Project loop limited to ${options.limit} projects.`)
  }
  return options
}
