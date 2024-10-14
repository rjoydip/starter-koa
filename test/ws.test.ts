import { describe, expect, it } from 'vitest'
import { ws } from '../src/ws'

describe('⬢ Validate ws', () => {
  it('● should validate hook instance', () => {
    expect(ws).toBeDefined()
  })
  // TODO: Add more unit testing for validateing each message methods
})
