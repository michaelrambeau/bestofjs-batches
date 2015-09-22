Parse = require('parse').Parse
ProjectBatch = require './../ProjectBatch'
_ = require 'underscore'

class UpdateParse extends ProjectBatch
  constructor: (keystone) ->
    super('Update Parse', keystone)
    Parse.initialize("PIOwYSa1c0roR2DzappwYcxxlcl9Hnem7tgRuEWd", "w8ONVoDGMFEKXMqVk1oNxIh30X5sopsY9TtvZBzD")
    @ParseProject = Parse.Object.extend("Project")

  getItems: (cb) ->
    @SuperProject.find(@options.project)
      .sort({name: 1})
      .exec (err, projects) =>
        if err then throw err
        cb (projects)

  processProject: (project, cb) ->
    console.log 'Checking', project.toString()
    @updateParseProject project, (err, data) =>
      #if data then console.log data;
      cb()

  updateParseProject: (project, cb) ->
    console.log 'Updating', project.toString()
    parseProject = new @ParseProject();
    #data = _.clone project
    data =
      name: project.name
      repository: project.repository
      stars: project.stars
      description: project.description
      deltas: project.deltas
    console.log 'Saving...', data
    parseProject.save data,
      success: (object) ->
        console.log 'success'
        cb()
      error: (object) ->
        console.log 'error'



module.exports = UpdateParse
