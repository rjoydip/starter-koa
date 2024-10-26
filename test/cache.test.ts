import { describe, expect, it, vi } from 'vitest'
import cache from '../src/cache'

vi.mock('unstorage/drivers/redis', () => ({
  default: (options: any) => ({
    getItem: async (key: string) => options.store.get(key),
    setItem: async (key: string, value: any) => options.store.set(key, value),
    removeItem: async (key: string) => options.store.delete(key),
  }),
}))

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
