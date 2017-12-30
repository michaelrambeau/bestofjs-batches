const { pick, get, flow } = require('lodash')

const { getScrapingData, getRepoData } = require('../helpers/github')
const { getLastSnapshot, isTodaySnapshot } = require('../helpers/snapshots')
const { updateDailyTrendsIfNeeded } = require('./helpers')

const processProject = options => async project => {
  const { logger, readonly } = options
  logger.debug('STEP 1: get project data from Github API', project.toString())
  const githubData = await getGithubData(project)
  const { full_name, stargazers_count } = githubData
  logger.debug('STEP 2: Get topics by scrapping Github web page', { full_name })
  const { topics, commit_count, contributor_count } = await getScrapingData(
    full_name,
    options
  )
  logger.debug('Scraping data', {
    full_name,
    topics,
    commit_count,
    contributor_count
  })
  logger.debug('STEP 3: save a snapshot record for today, if needed.')
  const {
    created,
    previous
  } = await takeSnapshotIfNeeded(project, stargazers_count, {
    models: options.models,
    logger
  })
  let updated = false
  project.github = Object.assign({}, githubData, {
    topics,
    contributor_count,
    commit_count
  })
  if (created) {
    // Update `trends.daily` if a snapshot has been saved
    project.trends = updateDailyTrendsIfNeeded(project, previous, options)
  }
  if (!readonly) {
    logger.debug('STEP 4: update project record from Github data', {
      githubData
    })
    try {
      await project.save()
      logger.verbose('Project saved!', project.toString())
      updated = true
    } catch (err) {
      throw new Error(
        `Unable to save project ${project.toString()} ${err.message}`
      )
    }
  }
  return { meta: { createdSnapshots: created === 1, updated } }
}

function getGithubData(project) {
  return getRepoData(project).then(parseGithubData)
}

function parseGithubData(data) {
  return flow([
    json =>
      pick(json, [
        'name',
        'full_name',
        'description',
        'homepage',
        'stargazers_count',
        'pushed_at',
        'created_at'
      ]),
    json =>
      Object.assign({}, json, {
        owner_id: get(json, 'owner.id'),
        branch: get(json, 'default_branch')
      })
  ])(data)
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
    return { created: false, previous: snapshot }
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
    return { created: true, previous: snapshot }
  }
}

module.exports = processProject
