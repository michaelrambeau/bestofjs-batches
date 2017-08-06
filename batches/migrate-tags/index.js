const async = require('async')

const start = function(batchOptions, done) {
  const Tag = batchOptions.models.Tag
  Tag.find({}).exec(function(err, docs) {
    console.log(docs.length, 'tags(s) to process')
    async.eachLimit(docs, 10, overwriteTagCode, function(err) {
      if (err) return done(err)
      return done(null, true)
    })
  })
}

//a basic function to check the loop
function processTag(tag, done) {
  console.log('Processing', tag.code)
  done(null, true)
}

//Set tag code to lower case
function overwriteTagCode(tag, done) {
  console.log('Processing', tag.code)
  var code = tag.code
  code = code.toLowerCase()
  tag.code = code
  tag.save(function(err, tag) {
    if (err) return done(err)
    console.log('Saved!', tag.code)
    done(null, true)
  })
}

module.exports = start
