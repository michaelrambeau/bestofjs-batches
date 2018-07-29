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
    contributor_count: Number,
    created_at: Date
  },
  npm: {
    name: String,
    version: String,
    dependencies: [String]
  },
  bundle: {
    name: String,
    dependencyCount: Number,
    gzip: Number,
    size: Number,
    version: String,
    errorMessage: String
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
  trends: Object,
  twitter: String
}

schema = new mongoose.Schema(fields, {
  collection: 'project'
})

schema.methods.toString = function() {
  return `Project ${this.name} ${this._id}`
}

// For some projects, don't use the GitHub description that is not really relevant
schema.methods.getDescription = function() {
  const { full_name, description } = this.github
  const overrideDescriptionList = ['apache/incubator-weex']
  const isNotRelevant = overrideDescriptionList.includes(full_name)
  const overrideGithubDescription = isNotRelevant || !description
  return overrideGithubDescription ? this.description : description
}

model = mongoose.model('Project', schema)

module.exports = model
