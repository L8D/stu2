require('dotenv').config()

const express = require('express')
const Promise = require('bluebird')
const redis = require('redis')
const moment = require('moment-timezone')
const twilio = require('twilio')

const tasks = require('./tasks')
const { parseTaskDeadlines, handleMessage } = require('./processor')

Promise.promisifyAll(redis.RedisClient.prototype)
Promise.promisifyAll(redis.Multi.prototype)

const from = process.env.STU_SENDER
const to = process.env.STU_RECEIVER
const port = process.env.PORT

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const timezone = process.env.STU_TIMEZONE

const db = redis.createClient(process.env.STU_REDIS_URL)

const heartbeat = async () => {
  const now = moment.tz(timezone)
  const date = now.format().slice(0, 10)

  const convertedTasks = parseTaskDeadlines(tasks, {
    date,
    timezone
  })

  const message = {
    type: 'heartbeat',
    createdAt: now.toISOString(),
    timezone
  }

  for (const action of await handleMessage(convertedTasks, message, db)) {
    console.log('handling action', action)
    if (action.type === 'outbound') {
      const twilioMessage = {
        body: action.value,
        from,
        to
      }

      console.log('sending twilio message', twilioMessage)
      await client.messages.create(twilioMessage)
      console.log('successfully sent twilio message', twilioMessage)
    } else if (action.type === 'set') {
      await db.setAsync(message.key, message.value)
    }
  }
}

const app = express()

app.listen(process.env.PORT, () => {
  console.log(`listening on port ${port}`)
})

setInterval(async () => {
  try {
    await heartbeat()
  } catch (err) {
    console.error(err)
  }
}, 60 * 1000)
