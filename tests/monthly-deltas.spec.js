const test = require('tape')
const { times } = require('lodash')
const moment = require('moment')

const {
  getMonthlySnapshots,
  getMonthlyDeltas
} = require('../batches/build-data/monthly-deltas')

// a project that gets 10 stars everyday
const getSnapshots = startDate =>
  times(400).map(i => ({
    createdAt: moment(startDate)
      .subtract(i, 'days')
      .toDate(),
    stars: 10000 - i * 10
  }))

test('Monthly trends - Checking `getMonthlySnapshots()`', t => {
  const options = { year: 2018, month: 1 }
  const startDate = new Date(2018, 0, 10)
  const snapshots = getSnapshots(startDate)
  const trends = getMonthlySnapshots(snapshots, options)
  t.ok(trends, 'Monthly deltas object should exist')
  const expected = [
    { stars: 9910, year: 2018, month: 1 },
    { stars: 9600, year: 2017, month: 12 },
    { stars: 9300, year: 2017, month: 11 },
    { stars: 8990, year: 2017, month: 10 },
    { stars: 8690, year: 2017, month: 9 },
    { stars: 8380, year: 2017, month: 8 },
    { stars: 8070, year: 2017, month: 7 },
    { stars: 7770, year: 2017, month: 6 },
    { stars: 7460, year: 2017, month: 5 },
    { stars: 7160, year: 2017, month: 4 },
    { stars: 6850, year: 2017, month: 3 },
    { stars: 6570, year: 2017, month: 2 },
    { stars: 6260, year: 2017, month: 1 }
  ]
  t.deepEqual(trends, expected, 'Should return an array of snapshots')
  t.end()
})

test('Monthly Deltas - Checking `getMonthlyDeltas()`', t => {
  const options = { year: 2018, month: 1 }
  const startDate = new Date(2018, 0, 10)
  const snapshots = getSnapshots(startDate)
  const expected = [
    { stars: 9600, year: 2017, month: 12, delta: 310 },
    { stars: 9300, year: 2017, month: 11, delta: 300 },
    { stars: 8990, year: 2017, month: 10, delta: 310 },
    { stars: 8690, year: 2017, month: 9, delta: 300 },
    { stars: 8380, year: 2017, month: 8, delta: 310 },
    { stars: 8070, year: 2017, month: 7, delta: 310 },
    { stars: 7770, year: 2017, month: 6, delta: 300 },
    { stars: 7460, year: 2017, month: 5, delta: 310 },
    { stars: 7160, year: 2017, month: 4, delta: 300 },
    { stars: 6850, year: 2017, month: 3, delta: 310 },
    { stars: 6570, year: 2017, month: 2, delta: 280 },
    { stars: 6260, year: 2017, month: 1, delta: 310 }
  ]
  const deltas = getMonthlyDeltas(snapshots, options)
  t.ok(deltas, 'Monthly deltas object should exist')
  t.deepEqual(deltas, expected, 'Should return an array of monthly delta items')
  t.end()
})

test('Monthly Deltas - Partial data, only 2 deltas', t => {
  const options = { year: 2018, month: 1 }
  const startDate = new Date(2018, 0, 10)
  const snapshots = getSnapshots(startDate).slice(0, 80)
  const expected = [
    { stars: 9600, year: 2017, month: 12, delta: 310 },
    { delta: 300, month: 11, stars: 9300, year: 2017 }
  ]
  const deltas = getMonthlyDeltas(snapshots, options)
  t.ok(deltas, 'Monthly deltas object should exist')
  t.deepEqual(deltas, expected, 'Should return an array of monthly delta items')
  t.end()
})

test('Monthly Deltas - Partial data, no delta', t => {
  const options = { year: 2018, month: 1 }
  const startDate = new Date(2018, 0, 10)
  const snapshots = getSnapshots(startDate).slice(0, 10)
  const expected = []
  const deltas = getMonthlyDeltas(snapshots, options)
  t.ok(deltas, 'Monthly deltas object should exist')
  t.deepEqual(deltas, expected, 'Should return an array of monthly delta items')
  t.end()
})
