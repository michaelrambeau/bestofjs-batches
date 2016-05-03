const request = require('request');

function githubRequest(url, cb) {
  const fullUrl = `https://api.github.com/${url}?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}`
  const options = {
    url: fullUrl,
    headers: {
      'User-Agent': process.env.GITHUB_USERNAME,
      'Accept': 'application/vnd.github.quicksilver-preview+json'
    }
  };
  return request.get(options, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      try {
        var json = JSON.parse(body);
        return cb(null, json);
      } catch (error1) {
        error = error1;
        return cb(new Error("Unable to parse JSON response from Github for url " + url + ": " + error));
      }
    } else {
      return cb(new Error("Invalid response from Github for url " + url));
    }
  });
}

const github = {
  getRepoData: function(project, cb) {
    const fullname = project.github && project.github.full_name ? (
      project.github.full_name
    ) : (
      /\/([^/]+\/[^/]+?$)/.exec(project.repository)[1]
    )
    githubRequest(`repos/${fullname}`, cb);
  },
  getUserData: function (username, cb) {
    githubRequest(`users/${username}`, cb);
  }
};

module.exports = github;