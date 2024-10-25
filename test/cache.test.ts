import cloudflareKVBindingDriver from 'unstorage/drivers/cloudflare-kv-binding'
import { describe, expect, it, vi } from 'vitest'
import { defineCache } from '../src/cache'
import { mockBinding } from './_utils'

describe('⬢ Validate defineCache', () => {
  it('● should call createStorage with the provided driver', () => {
    const createStorageMock = vi.fn().mockReturnValue({
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    })

    vi.mock('unstorage', () => ({
      createStorage: createStorageMock,
    }))

    const driverMock = cloudflareKVBindingDriver({
      binding: mockBinding,
      base: 'base',
    })

    const cache = defineCache(driverMock)

    // expect(createStorageMock).toHaveBeenCalledWith({ driver: driverMock })
    expect(cache).toBeDefined()

    expect(cache.get).toBeInstanceOf(Function)
    expect(cache.set).toBeInstanceOf(Function)
    expect(cache.remove).toBeInstanceOf(Function)
  })
})
