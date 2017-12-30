const { mapValues } = require('lodash')
const npm = require('../helpers/npm')

const processProject = options => async project => {
  const { logger } = options
  logger.debug('STEP1: get data from npm registry')
  const npmData = await getNpmData(project)
  logger.debug('STEP2: get data from packagequality.com')
  const packagequalityData = await getPackageQualityData(project)
  logger.debug('STEP3: get data npms.io')
  const npmsData = await npm.getNpmsData(project.npm.name)
  const npmsScore = npmsData.score
  const score = {
    detail: mapValues(npmsScore.detail, formatScore),
    final: formatScore(npmsScore.final)
  }
  if (npmData) project.npm = npmData // Update `npm` object only if we get data from the STEP1
  project.npms = { score }
  project.packagequality = packagequalityData
  await project.save()
  logger.debug('Project saved!', project.toString())
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
