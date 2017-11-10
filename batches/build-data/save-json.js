const fs = require('fs-extra')
const path = require('path')

function save(json, filename) {
  const filepath = path.join(process.cwd(), 'build', filename)
  return fs.outputJson(filepath, json)
}

module.exports = save
