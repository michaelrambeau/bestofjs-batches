request = require 'request'
async = require 'async'

github =
  request: (project, path, cb) ->
    url = project.repository.replace(/https\:\/\/github.com/, 'https://api.github.com/repos')
    url = "#{url}#{path}?#{process.env.GITHUB}"
    options =
      url: url
      headers:
        'User-Agent': process.env.GITHUB
        'Accept': 'application/vnd.github.quicksilver-preview+json'
    #console.log 'Check Github', url
    request.get options, (error, response, body) ->
      if not error and response.statusCode is 200
        try
          json = JSON.parse body
          cb null, json
        catch error
          cb new Error("Unable to parse JSON response from Github for url #{url}: #{error}")
      else
        cb new Error("Invalid response from Github for url #{url}")

  getRepoData: (project, cb) ->
    @request project, '', cb

  getReadme: (project, cb) ->
    @request project, '/readme', (err, json) ->
      if err
        cb err
      else
        buffer = new Buffer(json.content, 'base64')
        readme = buffer.toString('utf8')
        cb null, readme

module.exports = github
