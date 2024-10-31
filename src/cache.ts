import { createStorage } from 'unstorage'
import redisDriver from 'unstorage/drivers/redis'
import config from './config'

/**
 * Initializes a cache storage instance using Redis as the caching driver.
 *
 * @constant {Storage} cache - The cache storage instance for storing and retrieving data.
 * @type {object}
 */
const cache = createStorage({
  driver: redisDriver({
    url: config.cache_url,
    ttl: config.cache_ttl,
  }),
})

export default cache
