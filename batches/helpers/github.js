const request = require('request')
const fetch = require('node-fetch')
const scrapeIt = require('scrape-it')

function githubRequest (url, cb) {
  const fullUrl = `https://api.github.com/${url}?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}`
  const options = {
    url: fullUrl,
    headers: {
      'User-Agent': process.env.GITHUB_USERNAME,
      'Accept': 'application/vnd.github.quicksilver-preview+json'
    }
  }
  return request.get(options, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      try {
        var json = JSON.parse(body)
        return cb(null, json)
      } catch (err) {
        return cb(new Error(`Unable to parse JSON response from Github for url "${url}": ${err}`))
      }
    } else {
      return cb(new Error(`Invalid response from Github for url "${url}" ${response ? response.statusCode : ''} ${error ? error.toString() : ''}`))
    }
  })
}

const githubHelpers = {
  getRepoData: function (project, cb) {
    const fullname = project.github && project.github.full_name ? (
      project.github.full_name
    ) : (
      /\/([^/]+\/[^/]+?$)/.exec(project.repository)[1]
    )
    githubRequest(`repos/${fullname}`, cb)
  },
  getUserData: function (username, cb) {
    githubRequest(`users/${username}`, cb)
  },
  getPackage: function (project, branch, cb) {
    const url = `https://raw.githubusercontent.com/${project.github.full_name}/${branch}/package.json`
    fetch(url)
      .then(r => r.json())
      .then(json => cb(null, json))
      .catch(err => cb(err))
  },
  getTopics: function (full_name) {
    return scrapeIt(`https://github.com/${full_name}`, {
      topics: {
        listItem: '#topics-list-container a'
      }
    })
  }
}

module.exports = githubHelpers
