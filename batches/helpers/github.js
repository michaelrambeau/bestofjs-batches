const request = require('request-promise')
const fetch = require('node-fetch')
const scrapeIt = require('scrape-it')

function githubRequest(url) {
  const fullUrl = `https://api.github.com/${url}?client_id=${process.env
    .GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}`
  const options = {
    json: true,
    url: fullUrl,
    headers: {
      'User-Agent': process.env.GITHUB_USERNAME,
      Accept: 'application/vnd.github.quicksilver-preview+json'
    }
  }
  return request
    .get(options)
    .catch(
      error =>
        new Error(
          `Unable to parse JSON response from Github for url "${url}": ${error}`
        )
    )
}

const githubHelpers = {
  getRepoData: function(project) {
    const fullname =
      project.github && project.github.full_name
        ? project.github.full_name
        : /\/([^/]+\/[^/]+?$)/.exec(project.repository)[1]
    return githubRequest(`repos/${fullname}`)
  },
  getUserData: function(username) {
    return githubRequest(`users/${username}`)
  },
  getPackage: function(project, branch) {
    const url = `https://raw.githubusercontent.com/${project.github
      .full_name}/${branch}/package.json`
    return fetch(url).then(r => r.json())
  },
  // Scrape the GitHub project page to get data we cannot retrieve easily from the API!
  // Note added in 2017/09: `topics` be accessed from the API!
  getScrapingData: async function(full_name, options) {
    const { logger } = options
    const url = `https://github.com/${full_name}`
    logger.debug('Scraping the page', { url })
    const results = await scrapeIt(url, {
      topics: {
        listItem: '#topics-list-container a'
      },
      commit_count: {
        selector: '.numbers-summary .commits .num.text-emphasized',
        convert: toInteger
      },
      contributors: {
        selector: '.overall-summary li:nth-child(4) .num.text-emphasized',
        convert: toInteger
      }
    })
    const { contributor_count } = results.contributors
      ? { contributor_count: results.contributors }
      : await fetchContributorCount(full_name, options)
    return Object.assign({}, results, { contributor_count })
  }
}

// Convert a String from the web page E.g. `1,300` into an Integer
const toInteger = source => {
  const onlyNumbers = source.replace(/[^\d]/, '')
  return !onlyNumbers || isNaN(onlyNumbers) ? 0 : parseInt(onlyNumbers, 10)
}

// Note about how GitHub page works (Sep. 2017): for projects that are not very popular,
// The contributor count is dynamically fetch using an Ajax request, when the page loads.
function fetchContributorCount(full_name, options) {
  const url = `https://github.com/${full_name}/contributors_size`
  const { logger } = options
  logger.debug('Fetching contributor count...', { full_name })
  return scrapeIt(url, {
    contributor_count: {
      selector: '.num.text-emphasized',
      convert: toInteger
    }
  })
}

module.exports = githubHelpers
