import { describe, expect, it } from 'vitest'
import cache from '../src/cache'

describe('⬢ Validate cache', () => {
  it('● should set and retrieve a cache item', async () => {
    await cache.setItem('testKey', 'testValue')
    const result = await cache.getItem('testKey')
    expect(result).toBe('testValue')
  })

  it('● should delete a cache item', async () => {
    await cache.setItem('testKey', 'testValue')
    await cache.removeItem('testKey')
    const result = await cache.getItem('testKey')
    expect(result).toBeNull()
  })
})
