const { GraphQLClient } = require('graphql-request')
const scrapeIt = require('scrape-it')
const debug = require('debug')('github-client')

const { queryRepoInfo, extractRepoInfo } = require('./repo-info-query')

function createClient(accessToken) {
  const graphQLClient = new GraphQLClient('https://api.github.com/graphql', {
    headers: {
      authorization: `bearer ${accessToken}`
    }
  })

  return {
    fetchRepoInfo(fullName) {
      const [owner, name] = fullName.split('/')
      debug('Fetch repo info', owner, name)
      return graphQLClient
        .request(queryRepoInfo, { owner, name })
        .then(extractRepoInfo)
    },
    async fetchContributorCount(fullName) {
      const url = `https://github.com/${fullName}/contributors_size`
      const { contributor_count } = await scrapeIt(url, {
        contributor_count: {
          selector: '.num.text-emphasized',
          convert: toInteger
        }
      })
      return contributor_count
    }
  }
}

// Convert a String from the web page E.g. `1,300` into an Integer
const toInteger = source => {
  const onlyNumbers = source.replace(/[^\d]/, '')
  return !onlyNumbers || isNaN(onlyNumbers) ? 0 : parseInt(onlyNumbers, 10)
}

module.exports = createClient
