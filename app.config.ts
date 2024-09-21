import type { LogLevel } from 'consola'
import type { Services } from './src/types'
import { env, platform, runtime } from 'std-env'
import { defineConfig } from './src/config'

const { LOG_LEVEL = 3, ENABLE_HTTPS = false, PORT = 8080, HOST = '127.0.0.1', RATE_LIMIT = 100, RATE_DURATION = 6000, SERVICES = ['db', 'redis'], ENABLE_CACHE = false } = env

export default defineConfig({
  port: Number(PORT),
  host: HOST,
  isHTTPs: Boolean(ENABLE_HTTPS),
  services: SERVICES as Services[],
  ratelimit: Number(RATE_LIMIT),
  duration: Number(RATE_DURATION),
  log_level: LOG_LEVEL as LogLevel,
  enable_cache: Boolean(ENABLE_CACHE),
  system: {
    platform,
    runtime,
  },
})
