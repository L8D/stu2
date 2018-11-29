require('dotenv').config()

const express = require('express')
const Promise = require('bluebird')
const redis = require('redis')
const moment = require('moment-timezone')
const twilio = require('twilio')

const { handleHeartbeat } = require('./app')

Promise.promisifyAll(redis.RedisClient.prototype)
Promise.promisifyAll(redis.Multi.prototype)

const port = process.env.PORT

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const timezone = process.env.STU_TIMEZONE

const redisClient = redis.createClient(process.env.STU_REDIS_URL)

const app = express()

app.listen(process.env.PORT, () => {
  console.log(`listening on port ${port}`)
})

setInterval(async () => {
  try {
    const nowMoment = moment.tz(timezone)
    await handleHeartbeat({
      nowMoment,
      redisClient,
      twilioClient,
      logger: console
    })
  } catch (err) {
    console.error(err)
  }
}, 60 * 1000)
