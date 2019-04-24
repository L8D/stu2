const moment = require('moment-timezone')
const sortBy = require('lodash.sortby')

exports.parseTaskDeadlines = (tasks, options) => {
  const {
    timeFormats = ['h:mma', 'ha'],
    date = null,
    timezone = null
  } = options

  if (date == null || timezone == null) {
    throw new Error('date and timezone required')
  }

  return tasks.map(({ deadline, objective }) => ({
    deadline,
    finishBy: moment.tz(
      `${date} ${deadline}`,
      timeFormats.map((f) => `YYYY-MM-DD ${f}`),
      timezone
    ),
    objective
  }))
}

exports.handleMessage = async (tasks, message, db) => {
  const sortedTasks = sortBy(tasks, (t) => +t.finishBy)
  const now = moment.tz(message.createdAt, message.timezone)
  const date = now.format().slice(0, 10)

  // find the current task for the time we received the message
  const currentTaskIndex = sortedTasks.findIndex((task) => {
    return +task.finishBy > +now
  })

  const currentTask = sortedTasks[currentTaskIndex]
  const taskKey = `${date}:tasks:${currentTaskIndex}`

  if (message.type === 'heartbeat') {
    if (currentTask == null) {
      return []
    }

    const announcementKey = `${taskKey}:announcement`

    const announcement = await db.getAsync(announcementKey)

    if (announcement != null) { // we've already sent the announcement
      return [] // do nothing
    }

    const remainingMinutes = currentTask.finishBy.diff(now, 'minutes')

    const message = [
      currentTask.objective,
      `${remainingMinutes} minutes`
    ].join(' - ')

    return [
      {
        type: 'outbound',
        sentAt: now.format(),
        deadline: currentTask.deadline,
        value: message
      },

      {
        type: 'set',
        key: announcementKey,
        value: true
      }
    ]
  } else {
    return [
      {
        type: 'error',
        value: `Unknown message type "${message.type}" from message "${JSON.stringify(message)}"`
      }
    ]
  }
}
