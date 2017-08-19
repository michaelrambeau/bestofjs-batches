const fetch = require('node-fetch')
const packageJson = require('package-json')

function getNpmRegistryData(packageName) {
  return packageJson(packageName).catch(err => {
    const msg = err.message || ''
    throw new Error(`Invalid response from npm registry ${packageName} ${msg}`)
  })
}

function getPackageQualityData(packageName) {
  const { name, scope } = parsePackageName(packageName)
  var url = `http://packagequality.com/package/${name}`
  if (scope) url = `${url}?scope=${scope}`
  return fetch(url).then(r => r.json())
}

function getNpmsData(packageName) {
  // Update to npms.io API v2 in Nov, 2016 (see https://github.com/npms-io/npms-api/issues/56)
  // "scope package" name needs to encoded: `@blueprintjs/core` => `%40blueprintjs%2Fcore`
  const url = `https://api.npms.io/v2/package/${encodeURIComponent(
    packageName
  )}`
  return fetch(url).then(r => r.json()).catch(() => {
    throw new Error(`Invalid response from ${url}`)
  })
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
