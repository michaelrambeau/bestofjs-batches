// Read secrets from `.env` file in local development mode withou emitting error message
require('dotenv').config({ silent: true })
const fs = require('fs-extra')
const path = require('path')

const { notifySuccess } = require('./notify')
const createLogger = require('../createLogger')

async function main() {
  const logger = createLogger({ level: 'debug' })
  try {
    logger.debug('Send the daily notification...')
    const data = await readFile()
    const { projects } = data
    logger.debug('Projects to parse:', projects.length)
    await notify(projects)
    logger.info('Notification sent to Slack')
  } catch (e) {
    logger.error('Unable to notify Slack', { error: e.message })
  }
}

function readFile() {
  const filepath = path.join(process.cwd(), 'build', 'projects.json')
  return fs.readJson(filepath)
}

function notify(projects) {
  const url = process.env.SLACK_DAILY_WEBHOOK
  if (!url) throw new Error('No "SLACK_WEBHOOK" env. variable defined')
  const score = project => (project.deltas.length > 0 ? project.deltas[0] : 0)
  const topProjects = projects
    .sort((a, b) => (score(a) > score(b) ? -1 : 1))
    .slice(0, 5)
  const options = { url, projects: topProjects }
  // In local, override the default Slack channel to avoid send messages during tests
  const channel = process.env.SLACK_CHANNEL_TEST
  if (channel) options.channel = channel
  return notifySuccess(options)
}

main()

module.exports = main
