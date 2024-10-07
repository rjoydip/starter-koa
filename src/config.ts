import type { LogLevel } from 'consola'
import type { Runtime } from './types'
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
   * @type {?string}
   */
  monitor_dsn?: string
  /**
   * @type {?Runtime}
   */
  runtime?: Runtime
  /**
   * @type {?string}
   */
  AUTH_SECRET?: string
  /**
   * @type {?string}
   */
  AUTH_CALLBACK_URL?: string
  /**
   * @type {?string}
   */
  GITHUB_CLIENT_ID?: string
  /**
   * @type {?string}
   */
  GITHUB_CLIENT_SECRET?: string
  /**
   * @type {?string}
   */
  DATABASE_URL?: string
  /**
   * @type {?string}
   */
  DB_AUTH_TOKEN?: string
}

const {
  LOG_LEVEL = 3,
  ENABLE_HTTPS = false,
  PORT = 8080,
  HOST = '127.0.0.1',
  RATE_LIMIT = 70000,
  RATE_DURATION = 6000,
  GRACEFUL_DELAY = 500,
  MONITOR_DNS = '',
  RUNTIME = 'node',
  AUTH_SECRET = '',
  AUTH_CALLBACK_URL = '',
  GITHUB_CLIENT_ID = '',
  GITHUB_CLIENT_SECRET = '',
  DATABASE_URL = '',
  DB_AUTH_TOKEN = '',
} = env

export default {
  port: Number(PORT),
  host: HOST,
  isHTTPs: Boolean(ENABLE_HTTPS),
  ratelimit: Number(RATE_LIMIT),
  duration: Number(RATE_DURATION),
  log_level: LOG_LEVEL as LogLevel,
  graceful_delay: Number(GRACEFUL_DELAY),
  monitor_dsn: MONITOR_DNS,
  runtime: RUNTIME as Runtime,
  auth_secret: AUTH_SECRET,
  auth_callback_url: AUTH_CALLBACK_URL,
  github_client_id: GITHUB_CLIENT_ID,
  github_client_secrt: GITHUB_CLIENT_SECRET,
  db_url: DATABASE_URL,
  db_auth_token: DB_AUTH_TOKEN,
}
