import type { Server } from 'node:http'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import config from '../src/config'
import { createServer } from '../src/server'

describe('⬢ Validate server', () => {
  let server: Server

  beforeAll(() => {
    server = createServer()
  })

  afterAll(() => {
    server.close()
  })

  it('● should validated server not listening', () => {
    expect(server).toBeDefined()
    expect(server.listening).toBeFalsy()
  })

  it('● should validated server instance', () => {
    server.listen(config.port)
    expect(server.listening).toBeTruthy()
  })
})
