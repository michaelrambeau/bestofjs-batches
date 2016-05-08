const github = require('../helpers/github')
const getNpmData = require('./getNpmData')

// Fields to copy from Github API response
const fields = {
  github: ['name', 'avatar_url', 'followers', 'blog'],
  npm: ['username', 'count']
}

module.exports = function (hero, options) {
  return new Promise(function (resolve, reject) {
    const login = hero.github.login
    if (options.debug) console.log('Processing the hero', hero.toString())

    const p1 = new Promise(function (resolve, reject) {
      github.getUserData(login, function (err, json) {
        if (err) return reject(err)
        if (options.debug) console.log('Github API response OK', login)
        return resolve(json)
      })
    })

    const p2 = hero.npm.username === '-' ? (
      // A dash in the npm means username means that I did not found the guy on npm
      // No need to trigger invalid requests everyday
      Promise.resolve({
        username: '-',
        count: 0
      })
    ) : (
      getNpmData(hero.npm.username || login.toLowerCase())
      .then(r => {
        if (options.debug) console.log('npm site response OK', login)
        return r
      })
    )

    return Promise.all([p1, p2]).then(result => {
      const json = {
        github: result[0],
        npm: result[1]
      }

      var nbUpdate = 0
      Object.keys(fields).forEach(key => (
        fields[key].forEach(fieldName => {
          const value = json[key][fieldName]
          if (value !== hero[key][fieldName]) nbUpdate++
          hero[key][fieldName] = value
        })
      ))

      if (nbUpdate === 0) {
        console.log('> Database is already up-to-date', hero.toString())
        return resolve(success(hero, false))
      }

      if (options.debug) console.log('Data has to be updated', hero.toString(), nbUpdate, 'update(s)')
      hero.save(function (err) {
        if (err) {
          console.error(`Unable to save the hero ${login} ${err.message}`)
          reject(err)
        } else {
          console.log('> Hero saved!', hero.toString())
          resolve(success(hero, true))
        }
      })
    })
  })
}

function success (hero, saved) {
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
  const meta = {
    saved,
    processed: true
  }
  return {
    meta,
    payload
  }
}
