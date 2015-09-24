var fs = require('fs-extra');
// I use createOutputStream(file, [options]) from fs-extra package
// Exactly like createWriteStream, but if the directory does not exist, it's created.
var write = function (json, options, cb) {
  var writer = fs.createOutputStream('./build/projects.json');
  json.date = new Date();
  writer.write(JSON.stringify(json));
  writer.end();
  cb(null, {
    'msg': 'JSON file created.'
  });
};
module.exports = write;
