var parallel = require('async').parallel
var mongoose = require('mongoose')
require('dotenv').load()
var test = require('tape')

// Functions to test
const helpers = require('../batches/helpers/snapshots')
const getStars = helpers.getStars
const createSnapshot = helpers.createSnapshot
const getLastSnapshot = helpers.getLastSnapshot
const isTodaySnapshot = helpers.isTodaySnapshot
var dateOnly = require('../batches/build-data/functions').dateOnly

var Project = require('../models/Project')
var Snapshot = require('../models/Snapshot')
var Tag = require('../models/Tag')
var options = {}

const start = () => {
  console.log('Connecting the database...')
  var db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))
  db.once('open', function() {
    console.log('Db connection opened!')
    options.models = { Project, Snapshot, Tag }

    // Launch the tests!
    parallel([test1, test2, test3], function(err, result) {
      if (err) console.log('Error caught in the main callback', err)
      mongoose.disconnect()
      console.log('--- END, db connection closed ----')
    })
  })
}
//start()

test('Sample tests', t => {
  mongoose.connect(process.env.MONGO_URI)
  const db = mongoose.connection
  options.models = { Project, Snapshot, Tag }
  const end = () => {
    console.log('Closing the connection.')
    mongoose.disconnect()
    t.end()
  }
  db.once('open', () => {
    t.pass('Db connection OK')
    const tests = [test1(t), test2(t), test3(t)]
    Promise.all(tests).then(() => end())
  })
})

function test1(assert) {
  return new Promise(resolve => {
    const project = {
      _id: '55ab9d0f8f937d03008d41c4'
    }
    getLastSnapshot(project, { Snapshot: options.models.Snapshot }, function(
      err,
      result
    ) {
      console.log('res', result)
      if (err) {
        assert.fail('Error calling getLastSnapshot()', err)
        return resolve()
      }
      assert.ok(result, 'Should return a result')
      if (result) {
        assert.ok(
          !isNaN(result.stars),
          'Snapshot record should have a `stars` property'
        )
      }
      console.log('isTodaySnapshot?', isTodaySnapshot(result))
      console.log('date only=', dateOnly(new Date('2015-09-25T21:10:01.436Z')))
      return resolve()
    })
  })
}

function test2(assert) {
  console.log('test2')
  return new Promise(resolve => {
    const project = {
      _id: '55ab9d0f8f937d03008d41c4',
      repository: 'https://github.com/DrBoolean/mostly-adequate-guide'
    }
    const options = {
      Snapshot: {
        create: function(data, cb) {
          console.log('Snapshot created! [MOCK]', data)
          cb(data)
        }
      }
    }
    getStars(project, options, function(err, result) {
      if (err) console.log('An error occurred!', err)
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
      return resolve()
    })
  })
}

function test3(assert) {
  console.log('test3')
  return new Promise(resolve => {
    const project = {
      _id: '55ab9d0f8f937d03008d41c4',
      repository: 'https://github.com/DrBoolean/mostly-adequate-guide'
    }
    const options = {
      Snapshot: {
        create: function(data, cb) {
          console.log('Snapshot created! [MOCK]', data)
          cb(null, data)
        }
      }
    }
    createSnapshot(project, options, function(err, result) {
      if (err) console.log('An error occurred!', err)
      assert.ok(result, 'createSnapshot() should return something')
      if (result) {
        assert.ok(result.stars, 'Snapshot should have been created')
      }
      return resolve()
    })
  })
}
