mongoose = require 'mongoose'

fields =
  stars: Number
  createdAt:
    type: Date

schema = new mongoose.Schema fields,
  collection: 'snapshot'

model = mongoose.model('Snapshot', schema)
module.exports = model
