var createAllPoints, createDailyDeltas, createPoint, dateOnly, getTimeValue, moment, pointsToDeltas;

moment = require('moment');

createDailyDeltas = function(snapshots) {
  var deltas, points;
  points = createAllPoints(snapshots);
  deltas = pointsToDeltas(points);
  return deltas;
};

createAllPoints = function(snapshots) {
  var points;
  points = snapshots.map(function(doc) {
    return createPoint(doc);
  });
  points.sort(function(a, b) {
    return a.t - b.t;
  });
  return points;
};

createPoint = function(snapshot) {
  var point, snapshotDate;
  snapshotDate = new Date(snapshot.createdAt);
  point = {
    stars: snapshot.stars,
    t: getTimeValue(snapshotDate)
  };
  return point;
};

dateOnly = function(d) {
  d.setHours(d.getHours() + 9, 0, 0, 0);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

getTimeValue = function(date) {
  var d, delta, moment0, moment1, today;
  d = dateOnly(date);
  today = dateOnly(new Date());
  moment0 = moment(today);
  moment1 = moment(d);
  delta = moment0.diff(moment1, 'days');
  return delta;
};

pointsToDeltas = function(points) {
  var deltas, reducer;
  deltas = [];
  reducer = function(pointA, pointB) {
    if (pointA.t > -1) {
      deltas.push(pointA.stars - pointB.stars);
    }
    return pointB;
  };
  points.reduce(reducer, {
    t: -1
  });
  return deltas;
};

module.exports = {
  createPoint: createPoint,
  pointsToDeltas: pointsToDeltas,
  createAllPoints: createAllPoints,
  dateOnly: dateOnly,
  getTimeValue: getTimeValue,
  createDailyDeltas: createDailyDeltas
};
