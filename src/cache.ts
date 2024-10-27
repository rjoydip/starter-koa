import { createStorage } from 'unstorage'
import redisDriver from 'unstorage/drivers/redis'
import config from './config'
import { isTest } from './utils'

const cache = createStorage({
  driver: redisDriver({
    url: config.cache_url,
    ttl: isTest() ? 0 : 60,
  }),
})

export default cache
