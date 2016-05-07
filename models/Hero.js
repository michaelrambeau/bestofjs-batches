const mongoose = require('mongoose')

const fields = {
  createdAt: {
    type: Date
  },
  projects: {
    type: [mongoose.Schema.ObjectId],
    ref: 'Project'
  },
  short_bio: String,
  github: {
    login: String,
    name: String,
    avatar_url: String,
    blog: String,
    followers: Number
  },
  npm: {
    count: Number,
    username: String
  }
}

const schema = new mongoose.Schema(fields, {
  collection: 'heroes'
})

schema.methods.toString = function () {
  return `${this.github.login} (${this.github.name}) ${this.github.followers} followers, ${this.npm.count} modules`
}

const model = mongoose.model('Hero', schema)

module.exports = model
