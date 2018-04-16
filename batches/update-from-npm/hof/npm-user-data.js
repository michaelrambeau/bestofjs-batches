const scrapeIt = require('scrape-it')

async function getNpmData(npmUsername) {
  const t = +new Date()
  const url = `https://www.npmjs.com/~${npmUsername}?t=${t}`
  const { username, count } = await scrapeIt(url, {
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
  if (npmUsername !== username)
    throw new Error(`Unable to scrape ${npmUsername} page correctly`)
  return { count }
}

function getCount(text) {
  const a = /(\d+)/.exec(text)
  if (!a) return 0
  const count = a[1]
  return parseInt(count, 10)
}

module.exports = getNpmData
