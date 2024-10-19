import type { Server } from 'node:http'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import config from '../src/config.ts'
import logger from '../src/logger.ts'
import { createServer, handleGracefulShutdown } from '../src/server.ts'
import * as utils from '../src/utils.ts'

vi.mock('close-with-grace', () => ({
  default: (_, callback) => {
    callback({ err: new Error('Test error') })
  },
}))

describe('⬢ Validate server', () => {
  let server: Server
  const mockErrorLogger = vi.spyOn(logger, 'error').mockImplementation(
    () => {},
  )
  const mockCaptureException = vi.spyOn(utils, 'captureException')
    .mockImplementation(() => {})

  beforeAll(() => {
    server = createServer()
  })

  afterAll(() => {
    server.close()
  })

  it('● should validated server not listening', () => {
    expect(server).toBeDefined()
    expect(server.listening).toBeFalsy()
  })

  it('● should validated server instance', () => {
    server.listen(config.port)
    expect(server.listening).toBeTruthy()
  })

  it('● should log an error, capture exception, and close the app server', () => {
    process.env.GRACEFUL_DELAY = '0'
    vi.useFakeTimers()
    handleGracefulShutdown(server)
    vi.advanceTimersByTime(0)

    expect(mockErrorLogger).toHaveBeenCalledWith(
      '[close-with-grace] Error: Test error',
    )
    expect(mockCaptureException).toHaveBeenCalledWith(new Error('Test error'))

    vi.useRealTimers()
  })

  it('● should log an error, capture exception, and close the server after 500ms', () => {
    process.env.GRACEFUL_DELAY = '500'
    vi.useFakeTimers()
    handleGracefulShutdown(server)
    vi.advanceTimersByTime(500)

    expect(mockErrorLogger).toHaveBeenCalledWith(
      '[close-with-grace] Error: Test error',
    )
    expect(mockCaptureException).toHaveBeenCalledWith(new Error('Test error'))

    vi.useRealTimers()
  })
})
