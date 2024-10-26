import { faker } from '@faker-js/faker/locale/en'
import { RedisMemoryServer } from 'redis-memory-server'
import redisDriver from 'unstorage/drivers/redis'
import { afterEach, beforeEach, vi } from 'vitest'

vi.mock('../src/cache.ts', async () => {
  const { createStorage } = await import('unstorage')
  const redisServer = new RedisMemoryServer()
  const host = await redisServer.getHost()
  const port = await redisServer.getPort()
  return {
    default: createStorage({
      driver: redisDriver({
        base: 'test:',
        url: `redis://${host}:${port}`,
        ttl: 0,
      }),
    }),
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  faker.seed()
  vi.resetAllMocks()
})
