const https = require('https')
const request = require('request')
const moment = require('moment')

const roomId = process.env.GITTER_ROOM_ID
const token = process.env.GITTER_TOKEN
const gitterRoomSlug = process.env.GITTER_ROOM_SLUG
const slackHookUrl = process.env.SLACK_HOOK_URL
const heartbeat = ' \n'
const port = process.env.PORT || 443

const options = {
  hostname: 'stream.gitter.im',
  port,
  path: `/v1/rooms/${roomId}/${chatMessages}`,
  method: 'GET',
  headers: { Authorization: 'Bearer ' + token },
}

console.log(`Listening to: https://${options.hostname}${options.path}`)
console.log('Git Room Name:', gitterRoomSlug)

const req = https.request(options, (res) => {
  res.on('data', (chunk) => {
    const msg = chunk.toString()
    if (msg !== heartbeat) {
      console.log(`Received Gitter payload: ${msg} forwarding to Slack`)

      const gitterData = JSON.parse(msg)
      const sentDate = moment(gitterData.sent).format('MMM-D h:mm A')

      const slackMessage =
        `<https://gitter.im/${gitterRoomSlug}?at=${gitterData.id}|` +
        `[${sentDate}] @${gitterData.fromUser.username}>: ${gitterData.text}`

      request.post(
        slackHookUrl,
        { json: { text: slackMessage } },
        (err, resp, body) => {
          if (err) {
            console.log(err)
          }
        }
      )
    }
  })
})

req.on('error', (e) => {
  console.log('Something went wrong: ' + e.message)
})

req.end()
