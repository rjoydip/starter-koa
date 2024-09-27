import type { LogLevel } from 'consola'
import type { Runtime, Services } from './types'

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

/**
 * @export
 * @param {IConfig} config
 * @returns IConfig
 */
export function defineConfig(config: IConfig): IConfig {
  return config
}
