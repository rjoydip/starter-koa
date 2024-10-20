import type { LogLevel } from 'consola'
import type { Runtime } from './types.ts'
import { env } from 'node:process'

/**
 * @export
 * @interface IConfig
 * @typedef {IConfig}
 */
export interface IConfig {
  /**
   * @type {?number}
   */
  port?: number
  /**
   * @type {?boolean}
   */
  isHTTPs?: boolean
  /**
   * @type {?LogLevel}
   */
  log_level?: LogLevel
  /**
   * @type {?number}
   */
  ratelimit?: number
  /**
   * @type {?number}
   */
  duration?: number
  /**
   * @type {?number}
   */
  graceful_delay?: number
  /**
   * @type {?Runtime}
   */
  runtime?: Runtime
  /**
   * @type {?string}
   */
  monitor_dsn?: string
  /**
   * @type {?string}
   */
  db_url?: string
  /**
   * @type {?string}
   */
  cache_url?: string
}

const {
  LOG_LEVEL = 3,
  ENABLE_HTTPS = false,
  PORT = 3000,
  RATE_LIMIT = 70000,
  RATE_DURATION = 6000,
  GRACEFUL_DELAY = 500,
  RUNTIME = 'node',
  MONITOR_DNS = '',
  DATABASE_URL = '',
  CACHE_URL = '',
} = env

export default {
  port: Number(PORT),
  isHTTPs: Boolean(ENABLE_HTTPS),
  ratelimit: Number(RATE_LIMIT),
  duration: Number(RATE_DURATION),
  log_level: LOG_LEVEL as LogLevel,
  graceful_delay: Number(GRACEFUL_DELAY),
  monitor_dsn: MONITOR_DNS,
  runtime: RUNTIME as Runtime,
  db_url: DATABASE_URL,
  cache_url: CACHE_URL,
}
