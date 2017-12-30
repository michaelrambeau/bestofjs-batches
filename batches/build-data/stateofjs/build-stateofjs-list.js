const slugify = require('./slugify')
const { flatten } = require('lodash')

const processStateOfJSProject = fullList => stateOfJSProject => {
  const fullProject = fullList.projects.find(
    project => slugify(project.name) === stateOfJSProject.key
  )
  if (!fullProject) {
    console.error(
      `Unable to find the project ${JSON.stringify(stateOfJSProject)}`
    )
    return null
  }
  return {
    name: stateOfJSProject.text,
    description: fullProject.description,
    homepage: fullProject.url,
    slug: slugify(fullProject.name),
    github: fullProject.full_name,
    stars: fullProject.stars
  }
}

function buildStateOfJSList({ fullList, stateofjsList }) {
  const projects = flatten(Object.values(stateofjsList))
    .map(processStateOfJSProject(fullList))
    .filter(item => !!item)
  const json = {
    count: projects.length,
    updated_at: new Date(),
    projects
  }
  return json
}

module.exports = buildStateOfJSList
