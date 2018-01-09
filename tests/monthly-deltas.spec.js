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

if (true)
  test('Monthly trends - Checking `getMonthlySnapshots()`', t => {
    const options = { year: 2018, month: 1 }
    const startDate = new Date(2018, 0, 10)
    const snapshots = getSnapshots(startDate)
    const trends = getMonthlySnapshots(snapshots, options)
    t.ok(trends, 'Monthly deltas object should exist')
    const expected = [
      { month: 12, stars: 9900, year: 2017 },
      { month: 11, stars: 9590, year: 2017 },
      { month: 10, stars: 9290, year: 2017 },
      { month: 9, stars: 8980, year: 2017 },
      { month: 8, stars: 8680, year: 2017 },
      { month: 7, stars: 8370, year: 2017 },
      { month: 6, stars: 8060, year: 2017 },
      { month: 5, stars: 7760, year: 2017 },
      { month: 4, stars: 7450, year: 2017 },
      { month: 3, stars: 7150, year: 2017 },
      { month: 2, stars: 6840, year: 2017 },
      { month: 1, stars: 6560, year: 2017 },
      { month: 12, stars: 6250, year: 2016 }
    ]
    t.deepEqual(trends, expected, 'Should return an array of snapshots')
    t.end()
  })

if (true)
  test('Monthly Deltas - Checking `getMonthlyDeltas()`', t => {
    const options = { year: 2018, month: 1 }
    const startDate = new Date(2018, 0, 10)
    const snapshots = getSnapshots(startDate)
    const expected = [
      { delta: 310, month: 12, stars: 9900, year: 2017 },
      { delta: 300, month: 11, stars: 9590, year: 2017 },
      { delta: 310, month: 10, stars: 9290, year: 2017 },
      { delta: 300, month: 9, stars: 8980, year: 2017 },
      { delta: 310, month: 8, stars: 8680, year: 2017 },
      { delta: 310, month: 7, stars: 8370, year: 2017 },
      { delta: 300, month: 6, stars: 8060, year: 2017 },
      { delta: 310, month: 5, stars: 7760, year: 2017 },
      { delta: 300, month: 4, stars: 7450, year: 2017 },
      { delta: 310, month: 3, stars: 7150, year: 2017 },
      { delta: 280, month: 2, stars: 6840, year: 2017 },
      { delta: 310, month: 1, stars: 6560, year: 2017 }
    ]
    const deltas = getMonthlyDeltas(snapshots, options)
    t.ok(deltas, 'Monthly deltas object should exist')
    t.deepEqual(
      deltas,
      expected,
      'Should return an array of monthly delta items'
    )
    t.end()
  })

if (true)
  test('Monthly Deltas - One snapshot by month', t => {
    const options = { year: 2018, month: 1 }
    const snapshots = [
      {
        createdAt: new Date('2018-01-03'),
        stars: 14000
      },
      {
        createdAt: new Date('2017-12-31'),
        stars: 13000
      },
      {
        createdAt: new Date('2017-11-02'),
        stars: 15
      },
      {
        createdAt: new Date('2017-10-28'),
        stars: 14
      }
    ]
    const expected = [
      { delta: 12985, month: 12, stars: 13000, year: 2017 },
      { delta: 1, month: 11, stars: 15, year: 2017 }
    ]
    const deltas = getMonthlyDeltas(snapshots, options)
    t.deepEqual(
      deltas,
      expected,
      'Should return an array of monthly delta items'
    )
    t.end()
  })

if (true)
  test('Monthly Deltas - Partial data, only 2 deltas', t => {
    const options = { year: 2018, month: 1 }
    const startDate = new Date('2018-01-03T21:11:17.150Z')
    const snapshots = getSnapshots(startDate).slice(0, 80)
    const expected = [
      { delta: 310, year: 2017, month: 12, stars: 9960 },
      { delta: 300, year: 2017, month: 11, stars: 9650 }
    ]
    const deltas = getMonthlyDeltas(snapshots, options)
    t.deepEqual(
      deltas,
      expected,
      'Should return an array of monthly delta items'
    )
    t.end()
  })

if (true)
  test('Monthly Deltas - Partial data, no delta', t => {
    const options = { year: 2018, month: 1 }
    const startDate = new Date(2018, 0, 10)
    const snapshots = getSnapshots(startDate).slice(0, 10)
    const expected = []
    const deltas = getMonthlyDeltas(snapshots, options)
    t.deepEqual(
      deltas,
      expected,
      'Should return an array of monthly delta items'
    )
    t.end()
  })
