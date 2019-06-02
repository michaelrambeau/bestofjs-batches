require('dotenv').config()
const createClient = require('./github-api-client')
const debug = require('debug')('*')
const assert = require('assert')

const accessToken = process.env.GITHUB_ACCESS_TOKEN
const client = createClient(accessToken)

const fullName = 'expressjs/express'

async function main() {
  debug('Testing the GitHub API client')
  const repoInfo = await client.fetchRepoInfo(fullName)
  debug(repoInfo)
  assert.ok(Array.isArray(repoInfo.topics))
  const contributorCount = await client.fetchContributorCount(fullName)
  debug({ contributorCount })
  assert.ok(contributorCount > 200)
}

main()
