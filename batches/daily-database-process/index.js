/*
This batch combines the 3 steps of the daily process related to the database.
GOAL: Open and close the database connection only once (instead of 3 times)
In package.json, the `daily` script becomes:
"node batches daily-database-process && npm run deploy:prod && npm run notify"
instead of
"node batches github && node batches build && node batches hof && npm run deploy:prod && npm run notify"
*/
const githubBatch = require('../update-github-data')
const buildBatch = require('../build-data')
const hofBatch = require('../hof')

async function main(options) {
  const { logger } = options
  logger.info('> STEP 1')
  const githubResult = await githubBatch(options)
  logger.info('End of the `github` step', { result: githubResult.meta })
  logger.info('> STEP 2')
  const buildResult = await buildBatch(options)
  logger.info('End of the `build` step', { result: buildResult })
  logger.info('> STEP 3')
  const hofResult = await hofBatch(options)
  logger.info('End of the `hof` step', { result: hofResult })
  return { meta: { message: 'OK' } }
}

module.exports = main
