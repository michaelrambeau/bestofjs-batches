/* eslint-disable no-console */
const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
require('dotenv').load()
const test = require('tape')

const helpers = require('../batches/helpers/snapshots')
const getStars = helpers.getStars
const createSnapshot = helpers.createSnapshot
const getLastSnapshot = helpers.getLastSnapshot
const isTodaySnapshot = helpers.isTodaySnapshot
const dateOnly = require('../batches/build-data/functions').dateOnly
const Project = require('../models/Project')
const Snapshot = require('../models/Snapshot')
const Tag = require('../models/Tag')
const options = {}

test('Snapshot test', t => {
  console.log('Connecting the database...')
  mongoose.connect(process.env.MONGO_URI, { useMongoClient: true })
  t.plan(7)
  const db = mongoose.connection
  db.on('error', err => {
    console.error(err)
    t.fail('connection error')
  })
  db.once('open', function() {
    console.log('Db connection opened!')
    options.models = { Project, Snapshot, Tag }
    // test1(t)
    Promise.all([test1, test2, test3].map(fn => fn(t)))
      .then(() => {
        mongoose.disconnect()
        console.log('--- END, db connection closed ----')
      })
      .catch(err => {
        console.error(err)
      })
  })
})

function test1(assert) {
  return new Promise(async resolve => {
    const project = {
      _id: '55ab9d0f8f937d03008d41c4'
    }
    try {
      const result = await getLastSnapshot(project, {
        Snapshot: options.models.Snapshot
      })
      assert.ok(result, 'Should return a result')
      if (result) {
        assert.ok(
          !isNaN(result.stars),
          'Snapshot record should have a `stars` property'
        )
      }
      console.log('isTodaySnapshot?', isTodaySnapshot(result))
      console.log('date only=', dateOnly(new Date('2015-09-25T21:10:01.436Z')))
    } catch (err) {
      console.err(err)
      assert.fail(err.message)
    }
    return resolve()
  })
}

function test2(assert) {
  console.log('test2')
  return new Promise(async resolve => {
    const project = {
      _id: '55ab9d0f8f937d03008d41c4',
      repository: 'https://github.com/DrBoolean/mostly-adequate-guide'
    }
    const options = {
      Snapshot: {
        create: function(data) {
          console.log('Snapshot created! [MOCK]', data)
          return Promise.resolve(data)
        }
      }
    }
    try {
      const result = await getStars(project, options)
      assert.ok(result, 'getStars() should return something')
      if (result) {
        assert.ok(
          !isNaN(result.stars),
          'getStars() should return the number of stars'
        )
        assert.ok(
          result.stars > 1000,
          'getStars() should return a star count bigger than 1000'
        )
      }
    } catch (err) {
      console.err(err)
      assert.fail(err.message)
    }
    return resolve()
  })
}

function test3(assert) {
  console.log('test3')
  return new Promise(async resolve => {
    const project = {
      _id: '55ab9d0f8f937d03008d41c4',
      repository: 'https://github.com/DrBoolean/mostly-adequate-guide'
    }
    const options = {
      Snapshot: {
        create: function(data) {
          console.log('Snapshot created! [MOCK]', data)
          return Promise.resolve(data)
        }
      }
    }
    const result = await createSnapshot(project, options)
    try {
      assert.ok(result, 'createSnapshot() should return something')
      if (result) {
        assert.ok(result.stars, 'Snapshot should have been created')
      }
    } catch (err) {
      console.err(err)
      assert.fail(err.message)
    }
    return resolve()
  })
}
