import type { Server } from 'node:http'
import consola from 'consola'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { handleGracefulShutdown, startServer } from '../src'
import logger from '../src/logger'
import * as utils from '../src/utils'

describe('⬢ Validate server', () => {
  let appServer$: Server
  let graphServer$: Server
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
    const { appServer, graphqlServer } = await startServer()
    appServer$ = appServer
    graphServer$ = graphqlServer
  })

  beforeEach(() => {
    originalEnv = { ...process.env }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.clearAllMocks()
  })

  afterAll(() => {
    appServer$.close()
    graphServer$.close()
  })

  it('● should validate app server instace & listining', async () => {
    expect(appServer$).toBeDefined()
    expect(appServer$.listening).toBeTruthy()
  })

  it('● should log an error, capture exception, and close the app server', async () => {
    process.env.GRACEFUL_DELAY = '0'
    vi.useFakeTimers()
    handleGracefulShutdown({ appServer: appServer$, graphqlServer: graphServer$ })
    vi.advanceTimersByTime(0)

    expect(mockErrorLogger).toHaveBeenCalledWith('[close-with-grace] Error: Test error')
    expect(mockCaptureException).toHaveBeenCalledWith(new Error('Test error'))

    vi.useRealTimers()
  })

  it('● should log an error, capture exception, and close the server after 500ms', async () => {
    process.env.GRACEFUL_DELAY = '500'
    vi.useFakeTimers()
    handleGracefulShutdown({ appServer: appServer$, graphqlServer: graphServer$ })
    vi.advanceTimersByTime(500)

    expect(mockErrorLogger).toHaveBeenCalledWith('[close-with-grace] Error: Test error')
    expect(mockCaptureException).toHaveBeenCalledWith(new Error('Test error'))

    vi.useRealTimers()
  })
})
