var mongoose = require('mongoose');
var minimist = require('minimist');
var options = {};

//Check command line arguments
var argv = minimist(process.argv.slice(2));
var key = argv._[0];
if (argv.project) {
  options.project = {_id: argv.project};
}
require('dotenv').load();
require('coffee-script/register');

var batchTest = require('./batch-test');
var buildData = require('./build-data');

mongoose.connect(process.env.MONGO_URI);

var Project = require('../models/Project');
var Snapshot = require('../models/Snapshot');
var Tag = require('../models/Tag');

console.log('start the batch', key);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
  console.log('Db connection opened!');
  options.models = {Project, Snapshot, Tag};
  start(key, options);
});

function start(key, options) {
  switch (key) {
    case 'test':
      batchTest(options, function (err, result) {
        end(result);
      });
      break;
    case 'build':
      buildData(options, function (err, result) {
        end(result);
      });
      break;
    default:
      console.log('Specify the batch key as the 1st command line argument.');
      end();
  }
}

function end(result) {
  mongoose.disconnect();
  console.log("--- END ----", result);
}
