require('dotenv').config()

const Promise = require('bluebird')
const redis = require('redis')
const moment = require('moment-timezone')
Promise.promisifyAll(redis.RedisClient.prototype)
Promise.promisifyAll(redis.Multi.prototype)
const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const from = process.env.STU_SENDER
const to = process.env.STU_RECEIVER

const {
  parseTaskDeadlines,
  handleMessage
} = require('./processor')

const tasks = require('./tasks')

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

  for (const action of handleMessage(convertedTasks, message, db)) {
    if (action.type === 'outbound') {
      const twilioMessage = {
        body: message.value,
        from,
        to
      }

      await client.messages.create(twilioMessage)
      console.log('successfully sent ' + twilioMessage)
    } else if (action.type === 'set') {
      await db.setAsync(message.key, message.value)
    }
  }
}

setInterval(async () => {
  try {
    await heartbeat()
  } catch (err) {
    console.error(err)
  }
}, 60 * 1000)
