const helpers = require('../batches/helpers/github')

const full_names = [
  'BafS/Gutenberg',
  'michaelrambeau/bestofjs-webui'
]

const promises = full_names.map(full_name => {
  return helpers.getTopics(full_name)
    .then(r => console.log(r))
    .catch(e => console.error('Unable to fetch topics'))
})

Promise.all(promises)
  .then(() => console.log('The end'))
