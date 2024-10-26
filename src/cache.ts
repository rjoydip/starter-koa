import { createStorage } from 'unstorage'
import redisDriver from 'unstorage/drivers/redis'
import config from './config'

const cache = createStorage({
  driver: redisDriver({
    url: config.cache_url,
  }),
})

export default cache
