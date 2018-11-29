/* globals describe, it, expect, jest */

require('dotenv').config()
const moment = require('moment-timezone')

const { handleHeartbeat } = require('./app')

describe('app', () => {
  it('should handle a heartbeat', async () => {
    const mockLogger = {
      log: jest.fn()
    }

    const mockRedisClient = {
      setAsync: jest.fn(),
      getAsync: jest.fn(() => null)
    }

    const mockTwilioClient = {
      messages: {
        create: jest.fn()
      }
    }

    await handleHeartbeat({
      nowMoment: moment('2018-11-28T23:18:56.525Z').tz('America/Chicago'),
      logger: mockLogger,
      redisClient: mockRedisClient,
      twilioClient: mockTwilioClient
    })

    expect({
      loggerCalls: mockLogger.log.mock.calls,
      twilioCalls: mockTwilioClient.messages.create.mock.calls,
      redisSetCalls: mockRedisClient.setAsync.mock.calls,
      redisGetCalls: mockRedisClient.getAsync.mock.calls
    }).toMatchSnapshot()
  })
})
