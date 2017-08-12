const fetch = require('node-fetch')
const packageJson = require('package-json')

function getNpmRegistryData(packageName, cb) {
  packageJson(packageName)
    .then(data => {
      cb(null, data)
    })
    .catch(err => {
      const msg = err.message || ''
      new Error(`Invalid response from npm registry ${packageName} ${msg}`)
    })
}

function getPackageQualityData(packageName, cb) {
  const { name, scope } = parsePackageName(packageName)
  var url = `http://packagequality.com/package/${name}`
  if (scope) url = `${url}?scope=${scope}`
  fetch(url)
    .then(r => r.json())
    .then(json => cb(null, json))
    .catch(err => cb(err))
}

function getNpmsData(packageName, cb) {
  // Update to npms.io API v2 in Nov, 2016 (see https://github.com/npms-io/npms-api/issues/56)
  // "scope package" name needs to encoded: `@blueprintjs/core` => `%40blueprintjs%2Fcore`
  const url = `https://api.npms.io/v2/package/${encodeURIComponent(
    packageName
  )}`
  fetch(url)
    .then(r => r.json())
    .then(json => cb(null, json))
    .catch(() => cb(new Error(`Invalid response from ${url}`)))
}

function formatDependencies(dependencies) {
  return dependencies ? Object.keys(dependencies) : []
}

function parsePackageName(packageName) {
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
