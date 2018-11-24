const Promise = require('bluebird')
const moment = require('moment-timezone')
const flatten = require('lodash.flatten')

const {
  parseTaskDeadlines,
  process
} = require('./processor')

const exampleTasks = [
  {
    deadline: '7am',
    objective: 'wake up'
  },

  {
    deadline: '7:30am',
    objective: 'take theanine'
  },

  {
    deadline: '8am',
    objective: 'shower'
  },

  {
    deadline: '9am',
    objective: 'meditate'
  },

  {
    deadline: '12pm',
    objective: 'get out'
  },

  {
    deadline: '1pm',
    objective: 'eat lunch'
  },

  {
    deadline: '1:05pm',
    objective: 'log lunch'
  },

  {
    deadline: '6pm',
    objective: 'form a plan for getting home and eating dinner'
  },

  {
    deadline: '8pm',
    objective: 'go home and eat dinner'
  },

  {
    deadline: '8:20pm',
    objective: 'write'
  },

  {
    deadline: '8:40pm',
    objective: 'draw'
  },

  {
    deadline: '9pm',
    objective: 'wash'
  },

  {
    deadline: '9:30pm',
    objective: 'meditate'
  }
]

describe('executor', () => {
  it('should advance the state given the example plan', async () => {
    const timeFormats = ['h:mma', 'ha']
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
