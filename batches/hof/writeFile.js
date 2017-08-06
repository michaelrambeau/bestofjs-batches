const fs = require('fs-extra')

const filepath = './build/hof.json'

// Write `hof.json` file from an array of "heroes"
module.exports = function(heroes, options) {
  const logger = options.logger
  return new Promise(function(resolve) {
    logger.info('Writing json file', filepath, heroes.length, 'heroes')
    var writer = fs.createOutputStream(filepath)
    const json = {
      date: new Date(),
      heroes
    }
    writer.write(JSON.stringify(json))
    writer.end()
    const length = writer._writableState.length
    resolve({
      msg: `${filepath} file created`,
      length
    })
  })
}
