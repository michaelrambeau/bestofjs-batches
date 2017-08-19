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
  getTopics: function(full_name) {
    return scrapeIt(`https://github.com/${full_name}`, {
      topics: {
        listItem: '#topics-list-container a'
      }
    })
  }
}

module.exports = githubHelpers
