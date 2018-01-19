const mentionedProjects = [
  'sinonjs/sinon',
  'vuejs/vue-router',
  'tapjs/node-tap',
  'elm-lang/elm-compiler'
]

const isPopular = project => project.delta > 1000 || project.stars > 10000
const isMentioned = project => mentionedProjects.includes(project.full_name)

const isIncluded = project => isMentioned(project) || isPopular(project)

module.exports = isIncluded
