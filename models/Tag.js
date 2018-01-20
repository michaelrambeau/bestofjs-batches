var fields, model, mongoose, schema

mongoose = require('mongoose')

fields = {
  name: String,
  code: String,
  description: String,
  createdAt: {
    type: Date
  }
}

schema = new mongoose.Schema(fields, {
  collection: 'tag'
})

model = mongoose.model('Tag', schema)

module.exports = model
