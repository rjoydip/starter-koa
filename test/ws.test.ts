import { describe, expect, it } from 'vitest'
import { ws, wsTemplete } from '../src/ws'

describe('⬢ Validate ws', () => {
  it('● should validate hook instance', () => {
    expect(ws).toBeDefined()
  })
  it('● should validated wsTemplate', () => {
    expect(wsTemplete()).toBeDefined()
    expect(wsTemplete({ sse: true })).toBeDefined()
  })
  // TODO: Add more unit testing for validateing each message methods
})
