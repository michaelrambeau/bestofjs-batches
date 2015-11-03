import _ from 'lodash';
import async from 'async';
const waterfall = async.waterfall;
import github from '../helpers/github.coffee';
import {getLastSnapshot, isTodaySnapshot} from '../helpers/snapshots';

function processProject(project, options, done) {

  options.result.processed++;

  // Get data from Github API
  const f1 = function (callback) {
    if(options.debug) console.log('STEP1: get project data from Github API');
    getGithubData(project, (err, json) => {
      if (err) return done(err);
      callback(null, json);
    } );
  };

  //Update the project record
  const f2 = function (json, callback) {
    if(options.debug) console.log('STEP2: update project record from Github data');
    project.github = json;
    project.save(function (err, result) {
      if (err) {
        options.result.error++;
        console.error(`Unable to save project ${project.toString()} ${err.message}`);
      } else {
        if (options.debug) console.log('Project saved!', result);
        options.result.updated++;
      }
      callback(null, json);//pass json data to the next function
    });
  };

  const f3 = function (json, callback) {
    if(options.debug) console.log('STEP3: save a snapshot record for today, if needed.');
    const stars = json.stargazers_count;
    options.result.stars = options.result.stars + stars;
    takeSnapshotIfNeeded(project, stars, options.models, (err, result) => {
      if (err) {
        options.result.error++;
        callback(err);
      }
      if (result === 1) options.result.created++;
      callback(err, result);
    } );
  };

  waterfall([f1, f2, f3], done);
}

function getGithubData(project, cb) {
  console.log('Processing', project.toString());
  github.getRepoData(project, function(err, json) {
    if (err) {
      return cb(err);
    } else {
      cb(null, parseGithubData(json));
    }
  });
}

function parseGithubData(json) {
  const result = _.pick(json, [
    'name',
    'full_name',
    'description',
    'homepage',
    'stargazers_count',
    'pushed_at'
  ]);
  return result;
}

function takeSnapshotIfNeeded (project, stars, options, cb) {
  getLastSnapshot(project, options, function (err, snapshot) {
    if (err) return cb(new Error('An error occured when retrieving the last snapshot.' + err.message));
    if (snapshot && isTodaySnapshot(snapshot)) {
      //No snapshot to take, a snapshot has already been taken today!
      console.log('A snapshot already exists for today', snapshot.stars);
      cb(null, 0);
    } else {
      var data = {
        project: project._id,
        stars,
        createdAt: new Date()
      };
      options.Snapshot.create(data, function(err) {
        if (err) return cb(new Error(`Snapshot creation for ${project.toString()} failed: ${err.message}`));
        console.log('Snapshot created!', project.toString(), data.stars);
        return cb(null, 1);
      });
    }
  });
}

export default processProject;
