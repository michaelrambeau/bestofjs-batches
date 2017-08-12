const test = require('tape')
const { getNpmRegistryData } = require('../batches/helpers/npm')

test('It should get npm registry data', t => {
  getNpmRegistryData('react-dom', (err, result) => {
    if (err) return t.fail(err.message)
    const { dependencies, name } = result
    t.equal(name, 'react-dom', 'Package name shoud be the same as requested')
    t.ok(
      Array.isArray(Object.keys(dependencies)),
      'There should be several dependencies'
    )
    t.end()
  })
})
