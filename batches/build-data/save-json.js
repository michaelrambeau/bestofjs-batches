const fs = require('fs-extra')
const path = require('path')

function write(json, options, cb) {
  json.date = new Date()
  const filepath = path.join(process.cwd(), 'build', 'projects.json')
  fs.outputJson(filepath, json, err => {
    if (err) return cb(err)
    cb(null, {
      msg: 'JSON file created.'
    })
  })
}
module.exports = write
