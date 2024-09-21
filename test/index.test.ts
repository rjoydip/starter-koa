import type { Server } from 'node:http'
import consola from 'consola'
import request from 'supertest'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { shutdownGracefully, startServer } from '../src'
import logger from '../src/logger'

describe('⬢ Validate server', () => {
  let server: Server
  let originalEnv: NodeJS.ProcessEnv
  const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => { })

  beforeAll(async () => {
    process.exit = vi.fn(() => 1 as never)
    server = await startServer()
  })

  beforeEach(() => {
    consola.mockTypes(() => vi.fn())
    originalEnv = { ...process.env }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.clearAllMocks()
  })

  afterAll(() => {
    server.close()
  })

  it('● should respond to a basic request', async () => {
    const { status, body } = await request(server).get('/')
    expect(status).toBe(200)
    expect(body).toStrictEqual({
      message: 'Index',
      data: {},
      statusCode: 200,
    })
  })

  it('● should respond with 404 for unknown routes', async () => {
    const res = await request(server).get('/unknown-route')
    expect(res.status).toBe(404)
  })

  it('● should log shutdown for non-prod', async () => {
    process.env.NODE_ENV = 'development'
    expect(() => shutdownGracefully()).not.throw()
    expect(errorSpy).toBeCalledTimes(0)
  })
})
