var async, github, request;

request = require('request');

async = require('async');

github = {
  request: function(project, path, cb) {
    var options, url;
    if (project.github && project.github.full_name) {
      url = "https://api.github.com/repos/" + project.github.full_name;
    } else {
      url = project.repository.replace(/https\:\/\/github.com/, 'https://api.github.com/repos');
    }
    url = "" + url + path + "?client_id=" + process.env.GITHUB_CLIENT_ID + "&client_secret=" + process.env.GITHUB_CLIENT_SECRET;
    options = {
      url: url,
      headers: {
        'User-Agent': process.env.GITHUB_USERNAME,
        'Accept': 'application/vnd.github.quicksilver-preview+json'
      }
    };
    return request.get(options, function(error, response, body) {
      var error1, json;
      if (!error && response.statusCode === 200) {
        try {
          json = JSON.parse(body);
          return cb(null, json);
        } catch (error1) {
          error = error1;
          return cb(new Error("Unable to parse JSON response from Github for url " + url + ": " + error));
        }
      } else {
        return cb(new Error("Invalid response from Github for url " + url));
      }
    });
  },
  getRepoData: function(project, cb) {
    return this.request(project, '', cb);
  },
  getReadme: function(project, cb) {
    return this.request(project, '/readme', function(err, json) {
      var buffer, readme;
      if (err) {
        return cb(err);
      } else {
        buffer = new Buffer(json.content, 'base64');
        readme = buffer.toString('utf8');
        return cb(null, readme);
      }
    });
  }
};

module.exports = github;
