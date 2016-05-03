const mongoose = require('mongoose')

const fields = {
  createdAt: {
    type: Date
  },
  projects: {
    type: [mongoose.Schema.ObjectId],
    ref: 'Project'
  },
  github: {
    login: String,
    name: String,
    avatar_url: String,
    followers: Number
  }
}

const schema = new mongoose.Schema(fields, {
  collection: 'heroes'
})

schema.methods.toString = function () {
  return `${this.github.login} (${this.github.name}) ${this.github.followers}`
}

const model = mongoose.model('Hero', schema)

module.exports = model
