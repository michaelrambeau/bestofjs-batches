const request = require('request')
const fetch = require('node-fetch')

function getNpmRegistryData (packageName, cb) {
  const endPoint = 'http://registry.npmjs.org'
  const getUrl = packageName => {
    const array = /^(@.+)\/(.+)/.exec(packageName)
    if (array && array.length === 3) {
      // npm "scoped package" case, example: `@cycle/core`
      return `${endPoint}/${array[2]}/latest?scope=${array[1]}`
    }
    return `${endPoint}/${packageName}/latest`
  }
  const options = {
    url: getUrl(packageName)
  }
  // console.log('Checking npm registry', packageName, options)
  return request.get(options, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      try {
        var json = JSON.parse(body)
        return cb(null, json)
      } catch (err) {
        return cb(new Error(`Unable to parse JSON response from npm registry for package ${packageName} ${err.toString()}`))
      }
    } else {
      return cb(new Error(`Invalid response from npm registry ${packageName}`))
    }
  })
}

function getPackageQualityData (packageName, cb) {
  const url = `http://packagequality.com/package/${packageName} `
  fetch(url)
    .then(r => r.json())
    .then(json => cb(null, json))
    .catch(err => cb(err))
}

function formatDependencies (dependencies) {
  return dependencies ? Object.keys(dependencies) : []
}

module.exports = {
  getNpmRegistryData,
  getPackageQualityData,
  formatDependencies
}
