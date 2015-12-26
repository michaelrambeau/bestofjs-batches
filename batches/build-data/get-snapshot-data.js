var moment = require('moment');
var createDailyDeltas = require('./functions.coffee').createDailyDeltas;

// Return an object with 2 properties
// - stars: current number of stars
// - deltas: daily star variations
var getSnapshotData = function(project, options, cb) {
  var d, report;
  d = moment().subtract(30, 'days').toDate();
  d.setHours(0, 0, 0, 0);
  report = {
    stars: 0
  };
  options.Snapshot
  .find()
    .where('project').equals(project._id)
    .where('createdAt').gt(d)
    .sort({
      createdAt: -1
    })
    .exec(function(err, docs) {
      var deltas = createDailyDeltas(docs);
      report = {
        deltas: deltas,
        stars: docs.length > 0 ? docs[0].stars : 0
      };
      return cb(report);
    });
};

module.exports = getSnapshotData;
