import type { Server } from 'node:http'
import getPort from 'get-port'
import pify from 'pify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import WebSocket from 'ws'
import { createServer } from '../src/server.ts'
import { ws, wsTemplate } from '../src/ws.ts'

describe('⬢ Validate ws', () => {
  let server: Server
  let _ws: WebSocket

  beforeAll(async () => {
    const port = await getPort()
    server = createServer()
    await pify(server.listen(port))
    _ws = new WebSocket(`ws://127.0.0.1:${port}/`)
    await new Promise(resolve => _ws.addEventListener('open', resolve))
  })

  afterAll(async () => {
    ws.closeAll()
    await pify(server.close())
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

  /* it('● should validate error connection', async () => {
    const data = Buffer.alloc(2 * 1024 * 1024, 'a') // 2 MB
    _ws.send(data)
    const result = await new Promise(resolve => _ws.addEventListener('error', resolve))
    expect(result).toBeDefined()
  }) */
})
