const winston = require('winston')
require('winston-loggly')

const USE_LOGGLY = false
const token = process.env.LOGGLY_TOKEN

const options = {
  token,
  subdomain: 'michaelrambeau',
  tags: ['batches'],
  json: true,
  level: 'warn'
}

function createLogger({ level = 'info' } = {}) {
  const logger = new winston.Logger({
    level: level,
    json: true,
    transports: [new winston.transports.Console()]
  })
  if (USE_LOGGLY && token) {
    logger.add(winston.transports.Loggly, options)
  }
  return logger
}

module.exports = createLogger
