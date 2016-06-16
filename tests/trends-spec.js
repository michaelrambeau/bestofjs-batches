const test = require('tape')
const times = require('lodash').times

const helpers = require('../batches/build-data/functions')
const pointsToTrends = helpers.pointsToTrends

const data = [
  {
    input: [2000],
    output: []
  },
  {
    input: [2000, 1900],
    output: [100]
  },
  {
    input: [2000, 1900, 1800, 1600],
    output: [100]
  },
  {
    input: [2000, 1900, 1800, 1600, 1000, 1000, 1000, 1000],
    output: [100, 1000]
  },
  {
    // a project that gets 10 stars everyday
    input: times(50).reverse().map(s => 100 + s * 100),
    output: [100, 700, 3000]
  },
  {
    // a project that get 10 stars every day
    input: times(100).reverse().map(s => 100 + s * 10),
    output: [10, 70, 300, 900]
  },
  {
    // A project that does not get any star in 3 months
    input: times(100).reverse().map(s => 100),
    output: [0, 0, 0, 0]
  },
  {
    // A project that loses stars
    input: times(100).reverse().map(s => 100 - s),
    output: [-1, -7, -30, -90]
  }
]

data.forEach(item => {
  testSample(item)
})

function testSample (sample) {
  test('Checking trends functions', t => {
    const stars = sample.input
    const points = stars.map((s, i) => ({
      stars: s,
      t: i
    }))
    const trends = pointsToTrends(points)
    t.ok(trends, 'Trends object shoud exist')
    t.deepEqual(trends, sample.output, 'Trends array shoud contain star deltas')
    t.end()
  })
}
