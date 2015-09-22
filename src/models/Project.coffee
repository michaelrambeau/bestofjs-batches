mongoose = require 'mongoose'

fields =
  name: String
  url: String
  description: String
  repository: String
  tags:  [{type: mongoose.Schema.ObjectId, ref: 'Tag'}],
  createdAt:
    type: Date

schema = new mongoose.Schema fields,
  collection: 'project'

schema.methods.toString = () ->
  "Project " + this.name + ' ' + this._id;

model = mongoose.model('Project', schema)
module.exports = model
