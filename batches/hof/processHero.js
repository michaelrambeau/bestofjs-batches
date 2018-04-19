const github = require('../helpers/github')

const logHero = hero => Object.assign({}, hero.github, hero.npm)

async function processHero(hero, options) {
  const { logger, models } = options
  const model = models.Hero
  const login = hero.github.login
  try {
    const githubData = await github.getUserData(login)
    const updatedHero = Object.assign({}, hero, { github: githubData })
    const result = await model.update({ _id: hero._id }, updatedHero)
    const saved = result.nModified > 0
    if (saved) {
      logger.verbose('Db already up-to-date', logHero(hero))
      return aggregateHeroData(hero, { saved: false, processed: true })
    }
    await model.update({ _id: hero._id }, updatedHero)
    logger.verbose('Hero saved!', logHero(hero))
    return aggregateHeroData(hero, { saved: true, processed: true })
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
