import KeyvRedis from '@keyv/redis'
import Keyv from 'keyv'
import config from './config'
import { isTest } from './utils'

const cache = new Keyv({
  store: isTest() ? new Map() : new KeyvRedis(config.cache_url),
})

export { cache }
