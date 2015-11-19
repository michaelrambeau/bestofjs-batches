mongoose = require 'mongoose'

fields =
  name: String
  url: String
  description: String
  repository: String
  tags:  [{type: mongoose.Schema.ObjectId, ref: 'Tag'}],
  createdAt:
    type: Date
  disabled:
    type: Boolean
  deprecated:
    type: Boolean
  # data from github API, automatically updated by batches
  github:
    name: String
    full_name: String
    description: String
    homepage: String
    stargazers_count: Number
    pushed_at: Date


schema = new mongoose.Schema fields,
  collection: 'project'

schema.methods.toString = () ->
  "Project " + this.name + ' ' + this._id;

model = mongoose.model('Project', schema)
module.exports = model
