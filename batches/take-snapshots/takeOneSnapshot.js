const {getLastSnapshot, isTodaySnapshot, createSnapshot} = require('../helpers/snapshots');

//Check if there is already a snapshot created today for the given rroject
//and create the snapshot record in the database.
//INPUT: a project record
//OUTPUT: the number of stars of the created snapshot, 0 if the snapshot already exists.
const takeOneSnapshot = function (project, options, cb) {
  getLastSnapshot(project, options, function (err, snapshot) {
    if (err) return cb(new Error('An error occured when retrieving the last snapshot.' + err.message));
    if (snapshot && isTodaySnapshot(snapshot)) {
      //No snapshot to take, a snapshot has already been taken today!
      cb(null, 0);
    } else {
      createSnapshot(project, options, function (err, snapshot) {
        if (err) return cb(new Error('An error occured when creating the snapshot.' + err.message));
        const stars = snapshot.stars;
        cb(null, stars);
      });
    }
  });
};

module.exports = {
  takeOneSnapshot
};
