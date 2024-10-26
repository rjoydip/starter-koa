import { faker } from '@faker-js/faker/locale/en'
import { createDatabase } from 'db0'
import pglite from 'db0/connectors/pglite'
import { RedisMemoryServer } from 'redis-memory-server'
import { createStorage } from 'unstorage'
import redisDriver from 'unstorage/drivers/redis'
import { afterEach, beforeEach, vi } from 'vitest'
import * as db from '../src/db.ts'

vi.mock('../src/cache.ts', async () => {
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

vi.spyOn(db, 'dbInterface').mockImplementation(() =>
  createDatabase(
    pglite({
      dataDir: 'memory://',
    }),
  ),
)

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  faker.seed()
  vi.resetAllMocks()
})
