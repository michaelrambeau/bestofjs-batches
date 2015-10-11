var mongoose = require('mongoose');
var minimist = require('minimist');
require('dotenv').load();
require('coffee-script/register');

//Batch functions
var batchTest = require('./batch-test');
var buildData = require('./build-data');
var takeSnapshots = require('./take-snapshots');
var migrateTags = require('./migrate-tags');

var options = {};

//Check command line arguments
var argv = minimist(process.argv.slice(2));

//First argument of the command line: batch key
var key = argv._[0];

//Optional arguments: --project <id> --db test
if (argv.project) {
  options.project = {_id: argv.project};
}

let mongo_key = 'MONGO_URI';
if (argv.db) {
  mongo_key = 'MONGO_URI_' + argv.db.toUpperCase();
}

const mongo_uri = process.env[mongo_key];
if (!mongo_uri) throw new Error(`"${mongo_key}" env. variable is not defined.`);
console.log('Connecting to', mongo_uri);
mongoose.connect(mongo_uri);

//Load Mongoose models
var Project = require('../models/Project');
var Snapshot = require('../models/Snapshot');
var Tag = require('../models/Tag');

//Connect to the database and launch the batch when it is OK.
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log(`Db connection open, start the batch" ${key}"`);
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
    case 'snapshots':
      //Daily batch part 1: create snapshots records in the database
      takeSnapshots(options, function (err, result) {
        end(result);
      });
      break;
    case 'build':
      //Batch batch part 2: build static data
      buildData(options, function (err, result) {
        end(result);
      });
      break;
    case 'daily':
      //The daily batch
      takeSnapshots(options, function (err, result) {
        if (err) return console.log('Unexpected error during part 1', err);
        console.log(result);
        buildData(options, function (err, result) {
          if (err) return console.log('Unexpected error during part 2', err);
          end(result);
        });
      });
      break;
    case 'migrate-tags':
      migrateTags(options, function (err, result) {
        end(result);
      });
    break;
    default:
      console.log('Specify a valid batch key as the 1st command line argument.');
      end();
  }
}

function end(result) {
  mongoose.disconnect();
  console.log("--- END ---", result);
}
