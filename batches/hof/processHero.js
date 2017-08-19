const github = require('../helpers/github')
const getNpmData = require('./getNpmData')

// Fields to copy from Github API response
const fields = {
  github: ['name', 'avatar_url', 'followers', 'blog'],
  npm: ['username', 'count']
}

function processHero(hero, options) {
  const { logger } = options
  const login = hero.github.login
  try {
    logger.debug('Processing the hero', hero.toString())
    const githubData = github.getUserData(login)
    // A dash in the npm means username means that I did not found the guy on npm
    // No need to trigger invalid requests everyday
    const npmData =
      hero.npm.username === '-'
        ? Promise.resolve({ username: '-', count: 0 })
        : getNpmData(hero.npm.username || login.toLowerCase())
    return Promise.all([githubData, npmData]).then(result => {
      const json = {
        github: result[0],
        npm: result[1]
      }
      let nbUpdate = 0
      Object.keys(fields).forEach(key =>
        fields[key].forEach(fieldName => {
          const value = json[key][fieldName]
          if (value !== hero[key][fieldName]) nbUpdate++
          hero[key][fieldName] = value
        })
      )
      if (nbUpdate === 0) {
        logger.verbose('Db already up-to-date', hero.toString())
        return aggregateHeroData(hero, { saved: false, processed: true })
      }
      logger.debug(`${nbUpdate} field(s) to update'`, hero.toString())
      hero.save()
      logger.verbose('Hero saved!', hero.toString())
      return aggregateHeroData(hero, { saved: true, processed: true })
    })
  } catch (err) {
    logger.error(`Unable to save the hero ${login} ${err.message}`)
    return aggregateHeroData(hero, { error: true, processed: true })
  }
}

function aggregateHeroData(hero, meta) {
  const payload = {
    username: hero.github.login,
    avatar: hero.github.avatar_url,
    followers: hero.github.followers,
    blog: hero.github.blog,
    name: hero.github.name,
    projects: hero.projects,
    bio: hero.short_bio,
    npm: hero.npm.username,
    modules: hero.npm.count
  }
  return {
    meta,
    payload
  }
}

module.exports = processHero
