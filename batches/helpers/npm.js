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
  return fetch(url)
    .then(r => r.json())
    .catch(() => {
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

function getBundleData(packageName) {
  const url = `https://bundlephobia.com/api/size?package=${encodeURIComponent(
    packageName
  )}`
  const headers = {
    'x-bundlephobia-user': 'bestofjs.com'
  }
  const options = {
    headers
  }
  return fetch(url, options)
    .then(r => r.json())
    .catch(() => {
      // Internal Server Errors (no valid JSON)
      throw new Error(`Invalid response from ${url}`)
    })
}

function getPackageSizeData(packageName, version) {
  const url = `https://packagephobia.now.sh/api.json?p=${encodeURIComponent(
    packageName
  )}@${version}`
  const headers = {
    'x-packagephobia-user': 'bestofjs.com'
  }
  const options = {
    headers
  }
  return fetch(url, options)
    .then(r => r.json())
    .catch(e => {
      // Internal Server Errors (no valid JSON) returned for several projects including `node-sass`
      const message = `Invalid response from ${url} ${e.message ||
        '(no message)'}`
      return { error: { message } }
    })
}

module.exports = {
  getNpmRegistryData,
  getPackageQualityData,
  getNpmsData,
  formatDependencies,
  getBundleData,
  getPackageSizeData
}
