const test = require('tape')
const build = require('./build-stateofjs-list')

const sample = require('./sample.json')
const stateofjsList = {
  frontend: [{ key: 'angular-1', text: 'Angular' }]
}

test('It should build the State of JavaScript JSON object', assert => {
  const output = build({ fullList: sample, stateofjsList })
  console.log({ projects: output.projects })
  assert.ok(Array.isArray(output.projects))
  assert.end()
})
