const Promise = require('bluebird')
const { mapValues, get } = require('lodash')
const npm = require('../../helpers/npm')

const fetchNpmRegistryData = ({ logger }) => async project => {
  logger.debug('STEP1: get data from npm registry')
  const npmData = await getNpmData(project)
  logger.debug('NPM data', npmData)
  return npmData
}

const fetchNpmsData = ({ logger }) => async project => {
  logger.debug('STEP2: get data npms.io')
  const npmsData = await npm.getNpmsData(project.npm.name)
  const npmsScore = npmsData.score
  const score = {
    detail: mapValues(npmsScore.detail, formatScore),
    final: formatScore(npmsScore.final)
  }
  logger.debug('Score from npms.io', score)
  return { score }
}

const isBundleUpdateNeeded = project => {
  const isError = !!get(project.toObject(), 'bundle.errorMessage')
  if (isError) return false // don't try to fetch data if there was an build previously
  const projectJson = project.toObject()
  const npmVersion = get(projectJson, 'npm.version')
  const npmName = get(projectJson, 'npm.name')
  const bundleVersion = get(projectJson, 'bundle.version')
  const bundleName = get(projectJson, 'bundle.name')
  return npmVersion !== bundleVersion || bundleName !== npmName
}

const fetchBundleData = ({ logger }) => async project => {
  if (!isBundleUpdateNeeded(project)) {
    logger.debug(`Bundle size data already up-to-date for ${project.name}`)
    return null
  }
  logger.verbose('Fetch data about the bundle size', {
    project: project.name,
    version: get(project, 'npm.version'),
    previousVersion: get(project, 'bundle.version') || '(nothing)'
  })
  // return null
  try {
    const bundleData = await npm.getBundleData(project.npm.name)
    const isError = !!bundleData.error
    const bundle = isError
      ? { errorMessage: bundleData.error.message || 'Error!' }
      : {
          name: bundleData.name,
          dependencyCount: bundleData.dependencyCount,
          gzip: bundleData.gzip,
          size: bundleData.size,
          version: bundleData.version
        }
    logger.debug('Bundle data to be saved', bundle)
    return Object.assign({}, bundle, { updatedAt: new Date() })
  } catch (error) {
    logger.error(
      `Unable to get bundle data for ${project.toString()} ${error.message}`
    )
    return null
  }
}

const updateProject = ({ logger }) => async project => {
  const updates = {
    // npm: fetchNpmRegistryData,
    // npms: fetchNpmsData,
    bundle: fetchBundleData
  }
  const options = { concurrency: 1 }
  return Promise.map(
    Object.keys(updates),
    async key => {
      const fetchFn = updates[key]({ logger })
      const data = await fetchFn(project)
      if (data) project[key] = data // Update only if we get data (to avoid override with empty data)
    },
    options
  )
}

const processProject = options => async project => {
  const { logger, readonly } = options
  await updateProject(options)(project)
  const { npm, npms, bundle } = project.toObject()
  logger.debug(readonly ? 'Readonly mode' : 'Project saved', {
    project: project.toString(),
    npm,
    npms,
    bundle
  })
  if (!readonly) {
    await project.save()
  }
  return { meta: { updated: true } }
}

function getNpmData(project) {
  return npm.getNpmRegistryData(project.npm.name).then(result => ({
    name: project.npm.name, // don't use result.name here, we don't want to override name because of scoped packages!
    version: result.version,
    dependencies: npm.formatDependencies(result.dependencies)
  }))
}

function getPackageQualityData(project) {
  return npm
    .getPackageQualityData(project.npm.name)
    .then(result => ({ quality: formatScore(result.quality) }))
}

// Format score numbers from packagequality.com and npms.im into percents, with no decimals
// We may have no score to format (`ngx-datatable` cannot be found on packagequality.com)
const formatScore = score => (score ? Math.round(score * 100) : 0)

module.exports = processProject
