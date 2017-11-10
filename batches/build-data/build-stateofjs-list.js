const slugify = require('./slugify')
const shortList = require('./stateofjs2017.json')
const flatten = require('lodash').flatten

function processProject(project) {
  return {
    name: project.name,
    description: project.description,
    homepage: project.url,
    slug: slugify(project.name),
    github: project.full_name,
    stars: project.stars
  }
}
function buildStateOfJSList(fullList) {
  const slugs = flatten(Object.values(shortList)).map(project => project.key)
  const belongsToShortList = project => slugs.includes(slugify(project.name))
  const projects = fullList.projects
    .filter(belongsToShortList)
    .map(processProject)
  const json = {
    count: projects.length,
    updated_at: new Date(),
    projects
  }
  return json
}

module.exports = buildStateOfJSList
