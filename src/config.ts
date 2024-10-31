import type { LogLevel } from 'consola'
import type { Runtime } from './types'
import { env } from 'node:process'

/**
 * Configuration options for the application, including server, logging, rate limiting, and caching settings.
 *
 * @export
 * @interface IConfig
 */
export interface IConfig {
  /**
   * The port number the server listens on.
   * @type {number}
   */
  port?: number

  /**
   * Whether the server should use HTTPS.
   * @type {boolean}
   */
  isHTTPs?: boolean

  /**
   * Logging level for application logs.
   * @type {LogLevel}
   */
  log_level?: LogLevel

  /**
   * Maximum number of requests allowed per rate duration.
   * @type {number}
   */
  ratelimit?: number

  /**
   * Rate limit duration in milliseconds.
   * @type {number}
   */
  duration?: number

  /**
   * Delay in milliseconds before graceful shutdown.
   * @type {number}
   */
  graceful_delay?: number

  /**
   * Runtime environment for the application (e.g., "node", "browser").
   * @type {Runtime}
   */
  runtime?: Runtime

  /**
   * Data source name (DSN) for the monitoring service.
   * @type {string}
   */
  monitor_dsn?: string

  /**
   * Database connection URL.
   * @type {string}
   */
  db_url?: string

  /**
   * Redis or other cache service connection URL.
   * @type {string}
   */
  cache_url?: string

  /**
   * Time-to-live for cached items in seconds.
   * @type {number}
   */
  cache_ttl?: number
}

// Destructuring environment variables with default values.
const {
  LOG_LEVEL = '3',
  ENABLE_HTTPS = 'false',
  PORT = '3000',
  RATE_LIMIT = '70000',
  RATE_DURATION = '6000',
  GRACEFUL_DELAY = '500',
  RUNTIME = 'node',
  MONITOR_DNS = '',
  DATABASE_URL = '',
  CACHE_URL = '',
  CACHE_TTL = '1',
} = env

/**
 * Application configuration loaded from environment variables.
 *
 * @type {IConfig}
 */
const config: IConfig = {
  port: Number(PORT),
  isHTTPs: ENABLE_HTTPS === 'true',
  ratelimit: Number(RATE_LIMIT),
  duration: Number(RATE_DURATION),
  log_level: Number.parseInt(LOG_LEVEL, 10) as LogLevel,
  graceful_delay: Number(GRACEFUL_DELAY),
  runtime: RUNTIME as Runtime,
  monitor_dsn: MONITOR_DNS,
  db_url: DATABASE_URL,
  cache_url: CACHE_URL,
  cache_ttl: Number(CACHE_TTL),
}

export default config
