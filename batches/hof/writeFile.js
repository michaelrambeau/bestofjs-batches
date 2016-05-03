const fs = require('fs-extra')

const filepath = './build/hof.json'

// Write `hof.json` file from an array of "heroes"
module.exports = function (heroes) {
  return new Promise(function (resolve) {
    console.log('Wrting json file', filepath);
    var writer = fs.createOutputStream(filepath)
    const json = {
      date: new Date(),
      heroes
    }
    writer.write(JSON.stringify(json));
    writer.end();
    const length = writer._writableState.length;
    resolve({
      msg: `${filepath} file created`,
      length
    })
  })
}
