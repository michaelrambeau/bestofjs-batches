const mentionedProjects = [
  'sinonjs/sinon',
  'vuejs/vue-router',
  'tapjs/node-tap',
  'elm-lang/elm-compiler'
]

const isPopular = project => project.delta > 500 || project.stars > 3000
const isMentioned = project => mentionedProjects.includes(project.full_name)

const isIncluded = project => isMentioned(project) || isPopular(project)

module.exports = isIncluded
