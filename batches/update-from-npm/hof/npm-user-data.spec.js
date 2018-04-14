const test = require('tape')
const getNpmData = require('./npm-user-data')

const npmUsername = 'feross'

test(`It should get ${npmUsername}'s package count`, t => {
  getNpmData(npmUsername)
    .then(result => {
      const { username, count } = result
      t.equal(
        username,
        npmUsername,
        `We should have found the username "${npmUsername}" in the page`
      )
      t.equal(typeof count, 'number', 'Package count should be a number')
      t.ok(count > 100, 'The package count should be greater than 100')
      t.end()
    })
    .catch(err => t.fail(err.message))
})
