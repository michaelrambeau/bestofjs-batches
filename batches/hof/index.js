// Hall of Fame daily batch (see ./README.md)

const Promise = require('bluebird')

const processHero = require('./processHero')
const writeFile = require('./writeFile')
const slugify = require('../helpers/slugify')

// Replace an array of project db ids by their slugs
function convertHeroProjects(hero) {
  return Object.assign({}, hero, {
    projects: hero.projects.map(project => slugify(project.name))
  })
}

async function main(options) {
  const model = options.models.Hero
  const { logger, concurrency = 10 } = options
  const docs = await model
    .find()
    .populate({ path: 'projects', select: 'name' })
    .sort({ 'github.followers': -1 })
    .limit(options.limit)
  logger.info(docs.length, 'heroes to process...')
  return (
    Promise.map(docs, doc => processHero(doc, options), { concurrency })
      // STEP 1: update the database with fresh data from Github API
      .then(results => {
        const report = createReport(results.map(result => result.meta), [
          'processed',
          'saved'
        ])
        logger.info('First part OK', report)
        return results.map(result => result.payload)
      })
      // sort results by followers
      .then(heroes =>
        heroes.sort((a, b) => (getFollowers(a) > getFollowers(b) ? -1 : 1))
      )
      .then(heroes => heroes.map(hero => convertHeroProjects(hero)))
      // STEP 2: write the JSON file
      .then(heroes => writeFile(heroes, options))
      .then(result => ({ meta: result }))
  )
}

// Combine all individual reports `{ saved: true, processed: true }`
// into on single report `{ saved: 5, processed: 20 }`
function createReport(results, fields) {
  const initialReport = {}
  fields.forEach(field => {
    initialReport[field] = 0
  })
  const reducer = function(prev, current) {
    const report = {}
    fields.forEach(field => {
      report[field] = current[field] ? prev[field] + 1 : prev[field]
    })
    return report
  }
  return results.reduce(reducer, initialReport)
}

function getFollowers(hero) {
  return hero.followers
}

module.exports = main
