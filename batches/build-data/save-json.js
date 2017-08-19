const fs = require('fs-extra')
const path = require('path')

function write(json) {
  json.date = new Date()
  const filepath = path.join(process.cwd(), 'build', 'projects.json')
  return fs.outputJson(filepath, json)
}
module.exports = write
