var {waterfall} = require('async');
var mongoose = require('mongoose');
//var minimist = require('minimist');
require('dotenv').load();
require('coffee-script/register');
var test = require('tape');

//Functions to test
const { getStars, createSnapshot, getLastSnapshot, isTodaySnapshot } = require('../batches/helpers/snapshots');

mongoose.connect(process.env.MONGO_URI);

var Project = require('../models/Project');
var Snapshot = require('../models/Snapshot');
var Tag = require('../models/Tag');
var options = {};

console.log('Connecting the database...');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Db connection opened!');
  options.models = {Project, Snapshot, Tag};

  //Launch the tests!
  waterfall([test1, test2, test3], function () {
    end();
  });
});

function test1 (done) {
  test('1. Testing snapshots functions', (assert) => {
    const project = {
      _id: '55ab9d0f8f937d03008d41c4'
    };
    getLastSnapshot(project, {Snapshot: options.models.Snapshot}, function (err, result) {
      if (err) {
        assert.fail('Error calling getLastSnapshot()', err);
        assert.end();
        return done(err);
      }
      assert.ok(result, 'Should return a result');
      if (result) {
        assert.ok(!isNaN(result.stars), 'Snapshot record should have a `stars` property');
      }
      console.log('isTodaySnapshot?', isTodaySnapshot(result));
      assert.end();
      console.log('End of the 1st test suite.');
      done(null, true);
    });
  });
}

function test2(x, done) {
  test('2. Testing getStars() function', (assert) => {
    const project = {
      _id: '55ab9d0f8f937d03008d41c4',
      repository: 'https://github.com/DrBoolean/mostly-adequate-guide'
    };
    const options = {
      Snapshot: {
        create: function (data, cb) {
          console.log('Snapshot created! [MOCK]', data);
          cb(data);
        }
      }
    };
    console.log('Getting stars...');
    getStars(project, options, function (err, result) {
      if (err) console.log('An error occurred!', err);
      assert.ok(result, 'getStars() should return something');
      if (result) {
        assert.ok(!isNaN(result.stars), 'getStars() should return the number of stars');
        assert.ok(result.stars > 1000, 'getStars() should return a star count bigger than 1000');
      }
      assert.end();
      done(null, true);
    });
  });
}

function test3(x, done) {
  test('3. Testing createSnapshot() function', (assert) => {
    const project = {
      _id: '55ab9d0f8f937d03008d41c4',
      repository: 'https://github.com/DrBoolean/mostly-adequate-guide'
    };
    const options = {
      Snapshot: {
        create: function (data, cb) {
          console.log('Snapshot created! [MOCK]', data);
          cb(null, data);
        }
      }
    };
    createSnapshot(project, options, function (err, result) {
      assert.ok(result, 'createSnapshot() should return something');
      if (result) {
        assert.ok(result.stars, 'Snapshot should have been created');
      }
      assert.end();
      done(null, true);
    });
  });
}



function end(result) {
  mongoose.disconnect();
  console.log("--- END ----", result);
}
