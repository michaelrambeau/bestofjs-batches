const test = require('tape')
const dateOnly = require('../batches/build-data/functions').dateOnly

test('Testing dateOnly', assert => {
  const d = new Date('2015-09-25T21:10:01.436Z')
  const expected = 26
  const actual = (dateOnly(d)).getDate()
  assert.equal(actual, expected, 'Should return the day in Japanese time!')
  assert.end()
})
