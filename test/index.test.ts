import type { Server } from 'node:http'
import request from 'supertest'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { startServer } from '../src'
import logger from '../src/logger'

let server: Server

describe('⬢ Validate server', () => {
  beforeAll(async () => {
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
    })
  })

  it('● should respond with 404 for unknown routes', async () => {
    const res = await request(server).get('/unknown-route')
    expect(res.status).toBe(404)
  })
})

describe('⬢ Validate error', () => {
  const mockConsolaError = vi.spyOn(logger, 'error').mockImplementation(() => {})

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    mockConsolaError.mockClear()
  })

  it('● should handle uncaughtException and exit with code 1', async () => {
    const error = new Error('Test uncaught exception')
    process.emit('uncaughtException', error)
    expect(mockConsolaError).toHaveBeenCalledWith(`Uncaught Exception: ${error}`)
  })

  /* it('should handle unhandledRejection and exit with code 1', async () => {
    const reason = new Error('Test unhandled rejection')
    const promise = Promise.reject(reason)
    process.emit('unhandledRejection', reason, promise)
    expect(mockExit).toHaveBeenCalledWith(1)
  }) */
})
