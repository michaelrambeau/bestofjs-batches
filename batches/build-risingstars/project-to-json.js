const getProjectHomepage = project => {
  const homepage = project.github.homepage
  // npm package page is not a valid homepage!
  const isValid = url => !/npmjs\.com/.test(url) && !/npm\.im/.test(url)
  return homepage && isValid(homepage) ? homepage : project.url
}

function projectToJSON({ project, report }) {
  const description = project.github.description || project.description
  const data = {
    name: project.name, // Project name entered in the application (not the one from Github)
    url: getProjectHomepage(project),
    full_name: project.github.full_name, // 'strongloop/express' for example.
    description: description.slice(0, 100),
    // pushed_at: project.github.pushed_at,
    owner_id: project.github.owner_id,
    tags: project.tags.map(project => project.code),
    // contributor_count: project.github.contributor_count,
    delta: report.delta,
    stars: project.github.stargazers_count,
    created_at: project.github.created_at
  }
  // Project custom URL (will be displayed instead of Github owner's avatar)
  if (project.icon && project.icon.url) {
    data.icon = project.icon.url
  }
  return data
}

module.exports = projectToJSON
