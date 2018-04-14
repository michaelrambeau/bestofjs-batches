const Promise = require('bluebird')

// Launch the given `processHero` function on all `Hero` documents
async function launchHeroesBatch(processHeroFn, options) {
  const model = options.models.Hero
  const { logger, concurrency = 5 } = options
  const heroes = await model
    .find()
    .populate({ path: 'projects', select: 'name' })
    .sort({ 'github.followers': -1 })
    .limit(options.limit)
    .lean()
  logger.info(heroes.length, 'heroes to process...')
  const results = await Promise.map(
    heroes,
    hero => {
      logger.debug('Processing the hero', hero.github)
      return processHeroFn(hero, options)
    },
    {
      concurrency
    }
  )
  const reducer = (acc, val) => ({
    processed: acc.processed + val.meta.processed ? 1 : 0,
    saved: acc.saved + val.meta.saved ? 1 : 0,
    error: acc.error + val.meta.error ? 1 : 0
  })
  return { meta: results.reduce(reducer, { processed: 0, saved: 0 }) }
}

module.exports = launchHeroesBatch
