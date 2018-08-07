/*
Launch the given `processHeroFn` function on all `Hero` documents
Helper used by the 2 following batches:
- `update-update-from-npm-hof`
- `hof`
`processHeroFn` must return an object with the shape: {payload, meta}
*/
const Promise = require('bluebird')

async function launchHeroesBatch(processHeroFn, options) {
  const model = options.models.Hero
  const { logger, concurrency = 20 } = options
  const heroes = await model
    .find()
    .populate({ path: 'projects', select: 'name' })
    .sort(options.sort)
    .limit(options.limit)
    .lean()
  logger.info('Heroes to process...', { count: heroes.length, concurrency })
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
    processed: acc.processed + (val.meta.processed ? 1 : 0),
    saved: acc.saved + (val.meta.saved ? 1 : 0),
    error: acc.error + (val.meta.error ? 1 : 0)
  })
  return {
    payload: results.map(item => item.payload),
    meta: results.reduce(reducer, { processed: 0, saved: 0, error: 0 })
  }
}

module.exports = launchHeroesBatch
