const test = require('tape')
const times = require('lodash').times
const moment = require('moment')
const getTrends = require('../batches/build-data/monthly-trends')

// a project that gets 10 stars everyday
const snapshots = times(400).map(i => ({
  date: moment().subtract(i, 'days').toDate(),
  stars: 10000 - i * 10
}))

function testSample(snapshots) {
  test('Checking monthly trends functions', t => {
    const trends = getTrends(snapshots)
    console.log(trends)
    t.ok(trends, 'Trends object shoud exist')
    // t.deepEqual(trends, sample.output, 'Trends array shoud contain star deltas')
    t.end()
  })
}

testSample(snapshots)
