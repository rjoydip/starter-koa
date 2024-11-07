import getPort from 'get-port'
import Koa from 'koa'
import pify from 'pify'
import { describe, expect, it, vi } from 'vitest'
import config from '../src/config.ts'
import { createGraphQLServer, createServer, getServerInstance } from '../src/server.ts'

describe('⬢ Validate server', () => {
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
})
