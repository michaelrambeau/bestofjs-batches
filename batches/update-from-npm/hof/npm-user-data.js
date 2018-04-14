const scrapeIt = require('scrape-it')

module.exports = function getNpmData(username) {
  const t = +new Date()
  return scrapeIt(`https://www.npmjs.com/~${username}?t=${t}`, {
    username: {
      selector: 'h2',
      eq: 0, // First <h2> in the page
      convert: x => (x === '?' ? '' : x)
    },
    count: {
      selector: '#packages',
      convert: getCount
    }
  })
}

function getCount(text) {
  const a = /(\d+)/.exec(text)
  if (!a) return 0
  const count = a[1]
  return parseInt(count, 10)
}
