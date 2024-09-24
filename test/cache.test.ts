import { createCache } from 'async-cache-dedupe'
import { describe, expect, it, vi } from 'vitest'
import { setupCache } from '../src/cache'

vi.mock('async-cache-dedupe', () => ({
  createCache: vi.fn(() => ({
    define: vi.fn(),
  })),
}))

describe('⬢ Validate cache', () => {
  it('● should return cache object', () => {
    const mockFind = vi.fn()
    const entities = [
      { name: 'User', find: mockFind },
    ]
    const res = { entities }
    const opts = {}

    const cache = setupCache(res, opts)

    expect(cache).toBeDefined()
  })

  it('● should define cache for each entity', () => {
    const mockFind = vi.fn().mockResolvedValue('test result')
    const entities = [
      {
        name: 'User',
        find: mockFind,
      },
      {
        name: 'Post',
        find: mockFind,
      },
    ]

    const res = { entities }
    const opts = {
      ttl: 1000,
      stale: 2000,
    }

    const cache = setupCache(res, opts)

    expect(createCache).toHaveBeenCalledWith(opts)
    expect(cache.define).toHaveBeenCalledTimes(2)

    expect(cache.define).toHaveBeenNthCalledWith(
      1,
      'UserFind',
      expect.objectContaining({
        serialize: expect.any(Function),
      }),
      expect.any(Function),
    )
    expect(cache.define).toHaveBeenNthCalledWith(
      2,
      'PostFind',
      expect.objectContaining({
        serialize: expect.any(Function),
      }),
      expect.any(Function),
    )
  })
})
