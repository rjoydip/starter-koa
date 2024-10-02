import type { LogLevel } from 'consola'
import type { Runtime, Services } from './types'
import { env } from 'node:process'

/**
 * @export
 * @interface IConfig
 * @typedef {IConfig}
 */
export interface IConfig {
  /**
   * @type {?string}
   */
  host?: string
  /**
   * @type {?number}
   */
  port?: number
  /**
   * @type {?number}
   */
  graphql_port?: number
  /**
   * @type {?boolean}
   */
  isHTTPs?: boolean
  /**
   * @type {?LogLevel}
   */
  log_level?: LogLevel
  /**
   * @type {?Services[]}
   */
  services?: Services[]
  /**
   * @type {?number}
   */
  ratelimit?: number
  /**
   * @type {?number}
   */
  duration?: number
  /**
   * @type {?boolean}
   */
  enable_cache?: boolean
  /**
   * @type {?number}
   */
  graceful_delay?: number
  /**
   * @type {?string}
   */
  sentry_dsn?: string
  /**
   * @type {?Runtime}
   */
  runtime?: Runtime
}

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
  RUNTIME = 'node',
} = env

export default {
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
  runtime: RUNTIME as Runtime,
}
