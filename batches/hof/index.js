/*
Hall of Fame daily batch (see ./README.md)
*/

const processHero = require('./processHero')
const writeFile = require('./writeFile')
const slugify = require('../helpers/slugify')
const launchHeroesBatch = require('../helpers/launch-heroes-batch')

// Replace an array of project db ids by their slugs
function convertHeroProjects(hero) {
  return Object.assign({}, hero, {
    projects: hero.projects.map(project => slugify(project.name))
  })
}

function getFollowers(hero) {
  return hero.followers
}

async function main(options) {
  const { logger } = options
  const sort = { 'github.followers': -1 }
  logger.info('Launching the Hall of Fame npm data batch')
  const results = await launchHeroesBatch(
    processHero,
    Object.assign({}, options, { sort })
  )
  const heroes = results.payload
    .map(convertHeroProjects)
    .sort((a, b) => (getFollowers(a) > getFollowers(b) ? -1 : 1))
  writeFile(heroes, options)
  return results
}

module.exports = main
