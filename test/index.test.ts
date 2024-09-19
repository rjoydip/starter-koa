import type { Server } from 'node:http'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { shutdownGracefully, startServer } from '../src'
import logger from '../src/logger'

describe('⬢ Validate server', () => {
  let server: Server
  const mockConsolaLog = vi.spyOn(logger, 'log').mockImplementation(() => { })

  beforeAll(async () => {
    process.exit = vi.fn(() => 1 as never)
    server = await startServer()
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
      error: {},
      status: 'success',
      status_code: 200,
    })
  })

  it('● should respond with 404 for unknown routes', async () => {
    const res = await request(server).get('/unknown-route')
    expect(res.status).toBe(404)
  })

  it('● should log shutdown and force exit after timeout', async () => {
    await shutdownGracefully()
    expect(mockConsolaLog).toHaveBeenCalledWith('Shutting down server...')
  })
})
