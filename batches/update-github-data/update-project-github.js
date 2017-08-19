const _ = require('lodash')

const github = require('../helpers/github')
const helpers = require('../helpers/snapshots')

const getLastSnapshot = helpers.getLastSnapshot
const isTodaySnapshot = helpers.isTodaySnapshot

const processProject = options => async project => {
  const { logger } = options
  logger.debug('STEP1: get project data from Github API', project.toString())
  const json = await getGithubData(project)
  const full_name = json.full_name
  logger.debug('STEP2: Get topics by scrapping Github web page', { full_name })
  const { topics } = await github.getTopics(full_name)
  logger.debug('STEP3: update project record from Github data', json)
  project.github = Object.assign({}, json, { topics })
  let updated = false
  try {
    await project.save()
    logger.verbose('Project saved!', project.toString())
    updated = true
  } catch (err) {
    throw new Error(
      `Unable to save project ${project.toString()} ${err.message}`
    )
  }
  logger.debug('STEP4: save a snapshot record for today, if needed.')
  const stars = json.stargazers_count
  const result = await takeSnapshotIfNeeded(project, stars, {
    models: options.models,
    logger
  })
  return { meta: { created: result === 1, updated } }
}

function getGithubData(project) {
  return github.getRepoData(project).then(parseGithubData)
}

function parseGithubData(json) {
  const result1 = _.pick(json, [
    'name',
    'full_name',
    'description',
    'homepage',
    'stargazers_count',
    'pushed_at'
  ])
  const result2 = Object.assign({}, result1, {
    owner_id: _.get(json, 'owner.id'),
    branch: _.get(json, 'default_branch')
  })
  return result2
}

async function takeSnapshotIfNeeded(project, stars, options) {
  const { logger } = options
  const snapshot = await getLastSnapshot(project, options.models)
  if (snapshot && isTodaySnapshot(snapshot)) {
    // No snapshot to take, a snapshot has already been taken today!
    logger.verbose(
      `A snapshot already exists for today (${snapshot.stars} stars)`,
      project.name
    )
    return 0
  } else {
    const data = {
      project: project._id,
      stars,
      createdAt: new Date()
    }
    await options.models.Snapshot.create(data)
    logger.verbose(
      `Snapshot created (${data.stars})`,
      project.toString(),
      data.stars
    )
    return 1
  }
}

module.exports = processProject
