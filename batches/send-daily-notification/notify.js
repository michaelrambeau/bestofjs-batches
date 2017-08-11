const request = require('request-promise')

function projectToAttachment(project, pretext) {
  const url = project.url || `https://github.com/${project.full_name}`
  const owner = project.full_name.split('/')[0]
  const icon = project.icon
    ? project.icon
    : `https://avatars.githubusercontent.com/u/${project.owner_id}?v=3&s=50`
  const attachment = {
    color: '#e65100',
    pretext,
    author_name: owner,
    author_link: `https://github.com/${owner}`,
    author_icon: icon,
    title: project.name,
    title_link: url,
    text: project.description
  }
  return attachment
}

// Send a message to a Slack channel
function sendSlackMessage(text, { url, channel, attachments }) {
  const body = {
    text,
    mrkdwn: true,
    attachments
  }
  if (channel) {
    body.channel = channel // Override the default webhook channel, if specified (for tests)
  }
  const requestOptions = {
    url,
    body,
    json: true
  }
  return request.post(requestOptions)
}

function notifySuccess({ projects, url, channel }) {
  const attachments = projects.map((project, i) => {
    const stars = project.deltas[0]
    const text = `Number ${i + 1} +${stars} stars since today:`
    return projectToAttachment(project, text)
  })
  const text = 'TOP 5 Hottest Projects Today'
  return sendSlackMessage(text, { url, channel, attachments })
}

module.exports = {
  notifySuccess
}
