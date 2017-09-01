const test = require('tape')
const {
  isSameDay,
  dateToString,
  updateDailyTrendsIfNeeded
} = require('./helpers')

const d1 = new Date('2017-08-27T09:00:00.000Z')
const d2 = new Date('2017-08-27T12:00:00.000Z')
const d3 = new Date('2017-08-27T16:00:00.000Z')
const d4 = new Date('2017-08-28T01:00:00.000Z')
const logger = { debug: console.log }

test('Format date using Japan Timezone', assert => {
  assert.equal(dateToString(d1), '20170827')
  assert.equal(dateToString(d2), '20170827')
  assert.equal(dateToString(d3), '20170828')
  assert.equal(dateToString(d4), '20170828')
  assert.end()
})

test('Check if Date objects represent the same day', assert => {
  // next day
  assert.equal(isSameDay(d1, d2), true, 'Should return the same')
  assert.equal(isSameDay(d1, d3), false, 'Should NOT return the same')
  assert.equal(isSameDay(d3, d4), true, 'Should return the same')
  assert.end()
})

const project = {
  github: {
    stargazers_count: 101
  },
  trends: {
    daily: [0],
    updatedAt: d1
  }
}

test('Check if updating trends is needed => YES!', assert => {
  const previousSnapshot = { createdAt: d3, stars: 100 }
  const trends = updateDailyTrendsIfNeeded(project, previousSnapshot, {
    logger
  })
  assert.deepEqual(
    trends.daily,
    [1, 0],
    'It should insert a value in the array of deltas'
  )
  assert.ok(
    trends.updatedAt > project.trends.updatedAt,
    '`updatedAt` should be updated'
  )
  assert.end()
})

test('Check if updating trends is needed => no previous snapshot', assert => {
  const previousSnapshot = null
  const newProject = {
    github: {
      stargazers_count: 150
    }
  }
  const trends = updateDailyTrendsIfNeeded(newProject, previousSnapshot, {
    logger
  })
  assert.ok(trends === null)
  assert.end()
})

test('Check if updating trends is needed => only one snapshot', assert => {
  const previousSnapshot = { createdAt: d3, stars: 8 }
  const newProject = {
    github: {
      stargazers_count: 10
    }
  }
  const trends = updateDailyTrendsIfNeeded(newProject, previousSnapshot, {
    logger
  })
  assert.deepEqual(trends.daily, [2], 'It should create the array of deltas')
  assert.end()
})
