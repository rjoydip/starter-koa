import type { Server } from 'node:http'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { startServer } from '../src'

let server: Server

describe('⬢ Validate server', () => {
  beforeAll(async () => {
    server = await startServer()
  })

  afterAll(() => {
    server.close()
  })

  it('● should be listening', () => {
    expect(server.listening).toBe(true)
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
