const createLogger = require('./createLogger')

// Parse command line optional arguments and return an options object
// Optional arguments:
// --project <id>
// --db <key>
// --limit <number>
// --debugmode
// --readonly
// --loglevel
module.exports = function (argv) {
  const loglevel = argv.loglevel
  const logger = createLogger({ level: loglevel })
  const options = { logger }

  if (argv.project) {
    options.project = {_id: argv.project}
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
