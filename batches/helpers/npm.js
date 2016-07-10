const request = require('request')
const fetch = require('node-fetch')

function getNpmRegistryData (packageName, cb) {
  const endPoint = 'http://registry.npmjs.org'
  const getUrl = packageName => {
    const { name, scope } = parsePackageName(packageName)
    if (scope) {
      // npm "scoped package" case, example: `@cycle/core`
      return `${endPoint}/${name}/latest?scope=${scope}`
    }
    return `${endPoint}/${name}/latest`
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
  const { name, scope } = parsePackageName(packageName)
  var url = `http://packagequality.com/package/${name}`
  if (scope) url = `${url}?scope=${scope}`
  fetch(url)
    .then(r => r.json())
    .then(json => cb(null, json))
    .catch(err => cb(err))
}

function getNpmsData (packageName, cb) {
  const url = `https://api.npms.io/module/${packageName}`
  fetch(url)
    .then(r => r.json())
    .then(json => cb(null, json))
    .catch(err => cb(new Error(`Invalid response from ${url}`)))
}

function formatDependencies (dependencies) {
  return dependencies ? Object.keys(dependencies) : []
}

function parsePackageName (packageName) {
  var name = packageName
  var scope = ''
  const array = /^(@.+)\/(.+)/.exec(packageName)
  if (array && array.length === 3) {
    // npm "scoped package" case, example: `@cycle/core`
    scope = array[1]
    name = array[2]
  }
  return {
    name,
    scope
  }
}

module.exports = {
  getNpmRegistryData,
  getPackageQualityData,
  getNpmsData,
  formatDependencies
}
