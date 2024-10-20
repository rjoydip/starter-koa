import { describe, expect, it, vi } from 'vitest'
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
  const mockErrorLogger = vi.spyOn(logger, 'error').mockImplementation(
    () => {},
  )
  const mockCaptureException = vi.spyOn(utils, 'captureException')
    .mockImplementation(() => {})

  it('● should validated server not listening', () => {
    const server = createServer()
    expect(server).toBeDefined()
    expect(server.listening).toBeFalsy()
    server.close()
  })

  it('● should validated server instance', () => {
    const server = createServer()
    server.listen(config.port, () => {
      expect(server.listening).toBeTruthy()
      server.close()
    })
  })

  it('● should log an error, capture exception, and close the app server', () => {
    process.env.GRACEFUL_DELAY = '0'
    vi.useFakeTimers()
    const server = createServer()
    handleGracefulShutdown(server)
    vi.advanceTimersByTime(0)
    server.close()
    expect(mockErrorLogger).toHaveBeenCalledWith(
      '[close-with-grace] Error: Test error',
    )
    expect(mockCaptureException).toHaveBeenCalledWith(new Error('Test error'))

    vi.useRealTimers()
  })

  it('● should log an error, capture exception, and close the server after 500ms', () => {
    process.env.GRACEFUL_DELAY = '500'
    vi.useFakeTimers()
    const server = createServer()
    handleGracefulShutdown(server)
    vi.advanceTimersByTime(500)
    server.close()
    expect(mockErrorLogger).toHaveBeenCalledWith(
      '[close-with-grace] Error: Test error',
    )
    expect(mockCaptureException).toHaveBeenCalledWith(new Error('Test error'))

    vi.useRealTimers()
  })
})
