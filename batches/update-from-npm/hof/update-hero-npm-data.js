const { merge } = require('lodash')
const getNpmUserData = require('./npm-user-data')
const isValidUsername = username => username !== '' && username !== 'npm'

async function updateHeroNpmData(hero /*, options */) {
  const login = hero.github.login
  try {
    // A dash in the npm username means that I did not found the guy on npm
    // No need to trigger invalid requests everyday
    if (hero.npm.username === '-') return hero
    const npmData = await getNpmUserData(
      isValidUsername(hero.npm.username)
        ? hero.npm.username
        : login.toLowerCase()
    )
    const updatedHero = merge({}, hero, {
      npm: Object.assign(npmData, { updatedAt: new Date() })
    })
    return updatedHero
  } catch (err) {
    throw new Error(
      `Unable to get npm data for the hero ${login} ${err.message}`
    )
  }
}

module.exports = updateHeroNpmData
