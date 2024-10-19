import KeyvRedis from '@keyv/redis'
import Keyv from 'keyv'
import config from './config.ts'
import { isTest } from './utils.ts'

const cache = new Keyv({
  store: isTest() ? new Map() : new KeyvRedis(config.cache_url),
})

export { cache }
