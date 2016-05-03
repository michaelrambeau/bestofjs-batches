// Hall of Fame daily batch (see ./README.md)

const processHero = require('./processHero')
const writeFile = require('./writeFile')

module.exports = function (options, done) {
  const model = options.models.Hero
  model.find()
    .limit(options.limit)
    .then(docs => {
      console.log(docs.length, 'heroes to process...')
      const p = docs.map(doc => (
        processHero(doc, options)
      ))
      Promise.all(p)
        // STEP 1: update the database with fresh data from Github API
        .then(results => {
          const report = createReport(
            results.map(result => result.meta),
            ['processed', 'saved']
          )
          console.log('STEP 1 OK', report)
          return results.map(result => result.payload)
        })
        // STEP 2: write the JSON file
        .then(heroes => writeFile(heroes))
        .then(result => done(null, result))
        .catch(err => {
          console.log('Unexpected error while processing results', err)
          done(err)
        })
    })
    .catch(err => {
      console.log('Error!', err)
      done(err)
    })
}

// Combine all individual reports `{ saved: true, processed: true }`
// into on single report `{ saved: 5, processed: 20 }`
function createReport (results, fields) {
  const initialReport = {}
  fields.forEach(field => {
    initialReport[field] = 0
  })
  const reducer = function (prev, current) {
    const report = {}
    fields.forEach(field => {
      report[field] = current[field] ? prev[field] + 1 : prev[field]
    })
    return report
  }
  return results.reduce(reducer, initialReport)
}
