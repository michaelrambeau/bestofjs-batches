// Fetch Tag list from the database
function getTags (options, cb) {
  var model = options.Tag
  if (!model) return cb(new Error('No `Tag` model passed to options object!'))
  var fields = {
    code: 1,
    name: 1,
    _id: 0 // required to omit _id field
  }
  model.find({}, fields)
    .sort({'name': 1})
    .exec(function (err, docs) {
      if (err) return cb(err)
      cb(null, docs)
    })
}
module.exports = getTags
