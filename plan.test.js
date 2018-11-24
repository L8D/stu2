/* globals describe, it, expect */

const Promise = require('bluebird')
const moment = require('moment-timezone')

const {
  parseTaskDeadlines,
  process
} = require('./processor')

const exampleTasks = require('./tasks')

describe('executor', () => {
  it('should advance the state given the example plan', async () => {
    const date = '2018-11-23'
    const timezone = 'America/Chicago'

    // every five minutes
    const heartbeats = []
    let time = moment.tz(`${date}T06:00:00`, timezone)

    for (let i = 0; i < 300; i++) {
      heartbeats.push({
        type: 'heartbeat',
        createdAt: time.toISOString(),
        timezone
      })

      time = time.add(5, 'minutes')
    }

    const tasks = parseTaskDeadlines(exampleTasks, {
      date,
      timezone
    })

    const db = {
      cache: {},
      getAsync: (key) => Promise.resolve(db.cache[key])
    }

    const results = []

    for (const message of heartbeats) {
      for (const action of await process(tasks, message, db)) {
        results.push(action)

        // statefully handle 'set' operations between heartbeats
        if (action.type === 'set') {
          db.cache[action.key] = action.value
        }
      }
    }

    expect(results).toMatchSnapshot()
  })
})
