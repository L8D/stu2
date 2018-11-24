require('dotenv').config()

const Promise = require('bluebird')
const redis = require('redis')
const moment = require('moment-timezone')
Promise.promisifyAll(redis.RedisClient.prototype)
Promise.promisifyAll(redis.Multi.prototype)

const {
  parseTaskDeadlines,
  process
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

  for (const action of process(convertedTasks, message, db)) {
    if (action.type === 'outbound') {
      console.log(message.value)
      // TODO: twilio send
    } else if (action.type === 'set') {
      await db.setAsync(message.key, message.value)
    }
  }
}

setInterval(heartbeat, 60 * 1000)
