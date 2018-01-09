const fetch = require('node-fetch')

function fetchStars(project) {
  const { full_name } = project.github
  const url = `https://porter.io/api/v1/github.com/${full_name}?keys=starstats`
  console.log('Fetching', url)
  return fetch(url).then(r => r.json())
}

module.exports = fetchStars
