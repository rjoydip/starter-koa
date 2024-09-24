import type { LogLevel } from 'consola'
import type { Services } from './src/types'
import { env } from 'node:process'
import { defineConfig } from './src/config'

const {
  LOG_LEVEL = 3,
  ENABLE_HTTPS = false,
  PORT = 8080,
  HOST = '127.0.0.1',
  RATE_LIMIT = 70000,
  RATE_DURATION = 6000,
  SERVICES = ['db', 'redis'],
  ENABLE_CACHE = false,
  GRACEFUL_DELAY = 500,
  SENTRY_DNS = '',
} = env

export default defineConfig({
  port: Number(PORT),
  host: HOST,
  isHTTPs: Boolean(ENABLE_HTTPS),
  services: SERVICES as Services[],
  ratelimit: Number(RATE_LIMIT),
  duration: Number(RATE_DURATION),
  log_level: LOG_LEVEL as LogLevel,
  enable_cache: Boolean(ENABLE_CACHE),
  graceful_delay: Number(GRACEFUL_DELAY),
  sentry_dsn: SENTRY_DNS,
})
