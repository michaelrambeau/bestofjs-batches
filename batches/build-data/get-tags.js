//Fetch Tag list from the database
function getTags(options, cb) {
  var model = options.Tag;
  if (!model) return cb(new Error('No `Tag` model passed to options object!'));
  model.find({})
    .sort({'name': 1})
    .exec(function (err, docs) {
      if (err) return cb(err);
      cb(null, docs);
    });
}
module.exports = getTags;
