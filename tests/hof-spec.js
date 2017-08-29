require('dotenv').config({ silent: true })
const test = require('tape')
const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
require('../models/Project') // register the `Project` model, to be able to populate()
const HeroModel = require('../models/Hero')
const slugify = require('../batches/helpers/slugify')

var mongo_key = 'MONGO_URI'
const mongo_uri = process.env[mongo_key]
mongoose.connect(mongo_uri, { useMongoClient: true })

test('Find request', assert => {
  const db = mongoose.connection
  db.once('open', () => {
    HeroModel.find()
      .populate({ path: 'projects', select: 'github.name' })
      .sort({ 'github.followers': -1 })
      .limit(3)
      .then(docs => {
        console.log(
          docs.map((hero, i) =>
            console.log(
              i,
              hero.github.name,
              convertHeroProjects(hero.toObject())
            )
          )
        )
        assert.end()
        db.close()
      })
      .catch(err => assert.fail(err))
  })
})

function convertHeroProjects(hero) {
  console.log('Convert', hero.projects)
  return Object.assign({}, hero, {
    projects: hero.projects.map(project => slugify(project.github.name))
  })
}
