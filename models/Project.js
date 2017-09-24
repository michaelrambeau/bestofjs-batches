var fields, model, mongoose, schema

mongoose = require('mongoose')

fields = {
  name: String,
  url: String,
  description: String,
  repository: String,
  tags: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Tag'
    }
  ],
  createdAt: {
    type: Date
  },
  disabled: {
    type: Boolean
  },
  deprecated: {
    type: Boolean
  },
  github: {
    name: String,
    full_name: String,
    description: String,
    homepage: String,
    stargazers_count: Number,
    pushed_at: Date,
    branch: String,
    packageJson: Boolean,
    owner_id: Number,
    topics: Array,
    commit_count: Number,
    contributor_count: Number
  },
  npm: {
    name: String,
    version: String,
    dependencies: [String]
  },
  packagequality: {
    quality: Number
  },
  npms: {
    score: {
      detail: {
        maintenance: Number,
        popularity: Number,
        quality: Number
      },
      final: Number
    }
  },
  icon: {
    url: String
  },
  colors: {
    vibrant: String
  },
  trends: Object
}

schema = new mongoose.Schema(fields, {
  collection: 'project'
})

schema.methods.toString = function() {
  return `Project ${this.name} ${this._id}`
}

model = mongoose.model('Project', schema)

module.exports = model
