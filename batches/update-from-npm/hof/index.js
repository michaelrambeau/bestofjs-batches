/*
Daily script to update all Hall of Fame members (the "heroes") from data related to npm
Launched by the command: `node batches update-npm-hof`
*/
const launchHeroesBatch = require('./launch-heroes-batch')
const updateHeroNpmData = require('./update-hero-npm-data')

async function processHero(hero, options) {
  const { logger, models } = options
  const model = models.Hero
  const loggedHero = { username: hero.github.login }
  try {
    const updatedHero = await updateHeroNpmData(hero, options)
    const result = await model.update({ _id: hero._id }, updatedHero)
    const saved = result.nModified > 0
    logger.debug(saved ? 'Nothing to update' : 'Saved!', { hero: loggedHero })
    return {
      meta: { saved: result.nModified > 0, processed: true, error: false }
    }
  } catch (error) {
    logger.error(`Unable to process:  ${error.message}`, { hero: loggedHero })
    return { meta: { saved: false, processed: true, error: true } }
  }
}

async function main(options) {
  const { logger } = options
  logger.info('Launching the Hall of Fame npm data batch')
  return launchHeroesBatch(
    processHero,
    Object.assign({}, options, { concurrency: 1 }) // the scrapping does not work well if we increase the concurrency!
  )
}

module.exports = main
