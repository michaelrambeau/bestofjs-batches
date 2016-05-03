const github = require('../helpers/github')

// Fields to copy from Github API response
const fields = ['name', 'avatar_url', 'followers']

module.exports = function (hero, options) {
  return new Promise(function (resolve, reject) {
    const login = hero.github.login
    if (options.debug) console.log('Processing the hero', hero.projects);
    github.getUserData(login, function (err, json) {
      if (err) return reject(err);
      if (options.debug) console.log('Github API response OK', login);

      // Check if database has to be updated
      const isDifferent = fields.some(
        field => hero.github[field] !== json[field]
      )
      if (!isDifferent) {
        console.log('> Database is already up-to-date', hero.toString());
        return resolve(success(hero, false))
      }

      if (options.debug) console.log('Data has to be updated', login);
      fields.forEach(field => hero.github[field] = json[field])
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

function success(hero, saved) {
  const payload = {
    username: hero.github.login,
    avatar: hero.github.avatar_url,
    followers: hero.github.followers,
    name: hero.github.name,
    projects: hero.projects
  }
  console.log('PAYLOAD', payload)
  const meta = {
    saved,
    processed: true
  }

  return {
    meta,
    payload
  }
}
