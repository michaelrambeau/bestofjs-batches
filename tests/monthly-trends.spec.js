const test = require('tape')
const times = require('lodash').times
const moment = require('moment')
const getTrends = require('../batches/build-data/monthly-trends')

function testSample() {
  test('Checking monthly trends functions', t => {
    const startDate = new Date(2017, 0, 1)
    // a project that gets 10 stars everyday
    const snapshots = times(400).map(i => ({
      createdAt: moment(startDate)
        .subtract(i, 'days')
        .toDate(),
      stars: 10000 - i * 10
    }))
    const trends = getTrends(snapshots, { startDate })
    console.log(trends)
    t.ok(trends, 'Trends object should exist')
    const expected = [6330, 7240, 8150, 9070, 9380, 9680, 9990]
    t.deepEqual(
      trends,
      expected,
      'Should return an array of numbers of stars at different periods of time.'
    )
    t.end()
  })
}

testSample()
