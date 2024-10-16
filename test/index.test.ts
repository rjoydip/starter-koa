import type { Server } from 'node:http'
import process from 'node:process'
import consola from 'consola'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { handleGracefulShutdown, startServer } from '../src/index'
import logger from '../src/logger'
import * as utils from '../src/utils'

describe('⬢ Validate server', () => {
  let server: Server
  let originalEnv: NodeJS.ProcessEnv
  const mockErrorLogger = vi.spyOn(logger, 'error').mockImplementation(
    () => {},
  )
  const mockCaptureException = vi.spyOn(utils, 'captureException')
    .mockImplementation(() => {})

  vi.mock('close-with-grace', () => ({
    default: (_, callback) => {
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

  it('● should validate app server instace', () => {
    expect(server).toBeDefined()
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
