import type { Server } from 'node:http'
import consola from 'consola'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { handleGracefulShutdown, startServer } from '../src'
import logger from '../src/logger'
import * as utils from '../src/utils'

describe('⬢ Validate server', () => {
  let server: Server
  let originalEnv: NodeJS.ProcessEnv
  const mockErrorLogger = vi.spyOn(logger, 'error').mockImplementation(() => {})
  const mockCaptureException = vi.spyOn(utils, 'captureException').mockImplementation(() => {})

  vi.mock('close-with-grace', () => ({
    default: (_: any, callback: any) => {
      callback({ err: new Error('Test error') })
    },
  }))

  beforeAll(async () => {
    consola.mockTypes(() => vi.fn())
    server = await startServer()
  })

  beforeEach(() => {
    originalEnv = { ...process.env }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.clearAllMocks()
  })

  afterAll(() => {
    server.close()
  })

  it('● should validate server instace & listining', async () => {
    expect(server).toBeDefined()
    expect(server.listening).toBeTruthy()
  })

  it('● should log an error, capture exception, and close the server', async () => {
    process.env.GRACEFUL_DELAY = '0'
    vi.useFakeTimers()
    handleGracefulShutdown()
    vi.advanceTimersByTime(0)

    expect(mockErrorLogger).toHaveBeenCalledWith('[close-with-grace] Error: Test error')
    expect(mockCaptureException).toHaveBeenCalledWith(new Error('Test error'))

    vi.useRealTimers()
  })

  it('● should log an error, capture exception, and close the server after 500ms', async () => {
    process.env.GRACEFUL_DELAY = '500'
    vi.useFakeTimers()
    handleGracefulShutdown()
    vi.advanceTimersByTime(500)

    expect(mockErrorLogger).toHaveBeenCalledWith('[close-with-grace] Error: Test error')
    expect(mockCaptureException).toHaveBeenCalledWith(new Error('Test error'))

    vi.useRealTimers()
  })
})
