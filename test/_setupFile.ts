import { faker } from '@faker-js/faker/locale/en'
import { createStorage } from 'unstorage'
import cloudflareKVBindingDriver from 'unstorage/drivers/cloudflare-kv-binding'
import { afterEach, beforeEach, vi } from 'vitest'
import * as cache from '../src/cache.ts'
import { mockBinding } from './_utils'

vi.spyOn(cache, 'defineCache').mockImplementation(() => createStorage({
  driver: cloudflareKVBindingDriver({
    binding: mockBinding,
    base: 'base',
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  faker.seed()
  vi.resetAllMocks()
})
