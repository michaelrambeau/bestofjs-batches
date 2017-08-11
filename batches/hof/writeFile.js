const fs = require('fs-extra')
const path = require('path')

// Write `hof.json` file from an array of "heroes"
module.exports = function(heroes, options) {
  const logger = options.logger
  const filepath = path.join(process.cwd(), 'build', 'hof.json')
  const json = {
    date: new Date(),
    heroes
  }
  logger.info('Writing json file', filepath, heroes.length, 'heroes')
  return fs.outputJson(filepath, json).then(() => ({
    msg: `${filepath} file created`
  }))
}
