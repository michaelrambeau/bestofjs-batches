const test = require('tape')
const getNpmData = require('./npm-user-data')

const npmUsername = 'feross'

test(`It should get ${npmUsername}'s package count`, t => {
  getNpmData(npmUsername)
    .then(result => {
      const { count } = result
      t.equal(typeof count, 'number', 'Package count should be a number')
      t.ok(count > 100, 'The package count should be greater than 100')
      t.end()
    })
    .catch(err => t.fail(err.message))
})

test('It should throw an error if the username is not found', t => {
  getNpmData('thisisnotavalidusername')
    .then(() => {
      t.fail('It should be an error!')
    })
    .catch(err => {
      t.ok(
        err.message.startsWith('Unable to scrape'),
        'The username was not found'
      )
      t.end()
    })
})
