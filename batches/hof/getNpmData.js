const scrapeIt = require('scrape-it')

module.exports = function getNpmData (username) {
  return scrapeIt(`https://www.npmjs.com/~${username}`, {
    username: {
      selector: 'h1',
      convert: x => x === '?' ? '' : x
    },
    count: {
      selector: '#packages',
      convert: getCount
    }
  })
}

function getCount (text) {
  const a = /^(\d+) Packages by/.exec(text)
  if (!a) return 0
  const count = a[1]
  return parseInt(count, 10)
}
