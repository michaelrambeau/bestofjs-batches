const helpers = require('../helpers/projects')
const createClient = require('../shared/github-api-client')

const processAllProjects = helpers.processAllProjects
const getProjects = helpers.getProjects

async function startFixRepoInfo(options) {
  const logger = options.logger

  const accessToken = process.env.GITHUB_ACCESS_TOKEN
  const client = createClient(accessToken)

  const processProject = async project => {
    logger.verbose('Processing', {
      name: project.github.full_name
    })
    const info = await client.fetchRepoInfo(project.github.full_name)
    const { lastCommit, topics } = info
    logger.debug(project.name, { lastCommit, topics })
    project.github.last_commit = lastCommit
    project.github.topics = topics
    await project.save()
    return { meta: { success: true } }
  }

  const projects = await getProjects(
    Object.assign({}, options, {
      Project: options.models.Project,
      project: {
        deprecated: { $ne: true },
        ...options.project
      }
    })
  )

  const result = await processAllProjects(projects, processProject, {
    logger,
    concurrency: 2
  })
  return result
}

module.exports = startFixRepoInfo
