mongoose = require 'mongoose'

fields =
  name: String
  createdAt:
    type: Date

schema = new mongoose.Schema fields,
  collection: 'tag'

model = mongoose.model('Tag', schema)
module.exports = model
