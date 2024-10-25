import type { MockInstance } from 'vitest'
import { createStorage } from 'unstorage'
import cloudflareKVBindingDriver from 'unstorage/drivers/cloudflare-kv-binding'
import { vi } from 'vitest'
import * as cache from '../src/cache.ts'

const mockStorage = createStorage()

// https://developers.cloudflare.com/workers/runtime-apis/kv/
export const mockBinding = {
  get(key) {
    return mockStorage.getItem(key)
  },
  getKeys() {
    return mockStorage.getKeys()
  },
  getWithMetadata(key: string) {
    return mockStorage.getItem(key)
  },
  put(key, value) {
    return mockStorage.setItem(key, value)
  },
  delete(key) {
    return mockStorage.removeItem(key)
  },
  list(opts) {
    return mockStorage
      .getKeys(opts?.prefix || undefined)
      .then(keys => ({ keys: keys.map(name => ({ name })) }))
  },
}

export function mockCache(): MockInstance {
  return vi.spyOn(cache, 'defineCache').mockImplementation(() => createStorage({
    driver: cloudflareKVBindingDriver({
      binding: mockBinding,
      base: 'base',
    }),
  }))
}
