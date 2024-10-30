import type { Server } from 'node:http'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import WebSocket from 'ws'
import config from '../src/config.ts'
import { createServer } from '../src/server.ts'
import { ws, wsTemplate } from '../src/ws.ts'

describe('⬢ Validate ws', () => {
  let server: Server
  let _ws: WebSocket

  beforeAll(async () => {
    server = createServer()
    server.listen(config.port)
    _ws = new WebSocket(`ws://127.0.0.1:${config?.port}/`)
    await new Promise(resolve => _ws.addEventListener('open', resolve))
  })

  afterAll(async () => {
    ws.closeAll()
    server.close()
  })

  it('● should validated wsTemplate', () => {
    expect(wsTemplate()).toBeDefined()
    expect(wsTemplate({ sse: true })).toBeDefined()
  })

  it('● should peers connected', async () => {
    expect(ws.peers.size).toBe(1)
  })

  it('● should validate ping message', async () => {
    _ws.send('action=ping')
    const result = await new Promise(resolve => _ws.addEventListener('message', resolve))
    expect(result).toBeDefined()
  })

  it('● should validate health message', async () => {
    _ws.send('action=health')
    const result = await new Promise(resolve => _ws.addEventListener('message', resolve))
    expect(result).toBeDefined()
  })

  it('● should validate getUsers message', async () => {
    _ws.send('action=getUsers')
    const result = await new Promise(resolve => _ws.addEventListener('message', resolve))
    expect(result).toBeDefined()
  })

  it('● should validate invalid message', async () => {
    _ws.send('action=invalid')
    const result = await new Promise(resolve => _ws.addEventListener('message', resolve))
    expect(result).toBeDefined()
  })

  it('● should validate close connection', async () => {
    _ws.close()
    const result = await new Promise(resolve => _ws.addEventListener('close', resolve))
    expect(result).toBeDefined()
  })
})
