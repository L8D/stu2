const tasks = require('./tasks')
const { handleMessage, parseTaskDeadlines } = require('./processor')

const timezone = process.env.STU_TIMEZONE
const from = process.env.STU_SENDER
const to = process.env.STU_RECEIVER

exports.handleHeartbeat = async ({
  nowMoment,
  redisClient,
  twilioClient,
  logger
}) => {
  const date = nowMoment.format().slice(0, 10)

  const convertedTasks = parseTaskDeadlines(tasks, {
    date,
    timezone
  })

  const message = {
    type: 'heartbeat',
    createdAt: nowMoment.toISOString(),
    timezone
  }

  for (const action of await handleMessage(convertedTasks, message, redisClient)) {
    logger.log('handling action', action)
    if (action.type === 'outbound') {
      const twilioMessage = {
        body: action.value,
        from,
        to
      }

      logger.log('sending twilio message', twilioMessage)
      await twilioClient.messages.create(twilioMessage)
      logger.log('successfully sent twilio message', twilioMessage)
    } else if (action.type === 'set') {
      await redisClient.setAsync(action.key, action.value)
    }
  }
}
