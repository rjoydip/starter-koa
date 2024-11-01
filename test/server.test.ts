import getPort from 'get-port'
import Koa from 'koa'
import pify from 'pify'
import { describe, expect, it, vi } from 'vitest'
import config from '../src/config.ts'
import logger from '../src/logger.ts'
import { createGraphQLServer, createServer, getServerInstance, handleGracefulShutdown } from '../src/server.ts'
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

  it('● should validated http server instance', async () => {
    vi.spyOn(config, 'isHTTPs', 'get').mockReturnValue(false)
    const app = new Koa({})
    const httpServer = getServerInstance(config)(app.callback())
    expect(httpServer.listening).toBeFalsy()
  })

  it('● should validated https server instance', async () => {
    vi.spyOn(config, 'isHTTPs', 'get').mockReturnValue(true)
    const app = new Koa({})
    const httpServer = getServerInstance(config)(app.callback())
    expect(httpServer.listening).toBeFalsy()
  })

  it('● should validated server not listening', async () => {
    const server = createServer()
    const graphqlServer = createGraphQLServer()
    expect(server).toBeDefined()
    expect(server.listening).toBeFalsy()
    expect(graphqlServer).toBeDefined()
    expect(graphqlServer.listening).toBeFalsy()
    if (server.listening) {
      await pify(server.close())
    }
    if (graphqlServer.listening) {
      await pify(graphqlServer.close())
    }
  })

  it('● should validated server instance', async () => {
    const port = await getPort()

    const server = createServer()
    await pify(server.listen(port))
    expect(server.listening).toBeTruthy()
    await pify(server.close())

    const graphqlServer = createGraphQLServer()
    await pify(graphqlServer.listen(port + 1))
    expect(graphqlServer.listening).toBeTruthy()
    await pify(graphqlServer.close())
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
