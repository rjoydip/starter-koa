import { faker } from '@faker-js/faker/locale/en'
import { RedisMemoryServer } from 'redis-memory-server'
import { afterEach, beforeEach, vi } from 'vitest'

vi.mock(import('../src/config.ts'), async (importOriginal) => {
  const actual = await importOriginal()
  const redisServer = new RedisMemoryServer()
  const host = await redisServer.getHost()
  const port = await redisServer.getPort()
  return {
    ...actual,
    cache_url: `redis://${host}:${port}`,
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  faker.seed()
  vi.resetAllMocks()
})
