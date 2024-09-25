import type { LogLevel } from 'consola'
import type { Runtime, Services } from './types'

/**
 * ${1:Description placeholder}
 *
 * @export
 * @interface IConfig
 * @typedef {IConfig}
 */
export interface IConfig {
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  host?: string
  /**
   * ${1:Description placeholder}
   *
   * @type {?number}
   */
  port?: number
  /**
   * ${1:Description placeholder}
   *
   * @type {?boolean}
   */
  isHTTPs?: boolean
  /**
   * ${1:Description placeholder}
   *
   * @type {?LogLevel}
   */
  log_level?: LogLevel
  /**
   * ${1:Description placeholder}
   *
   * @type {?Services[]}
   */
  services?: Services[]
  /**
   * ${1:Description placeholder}
   *
   * @type {?number}
   */
  ratelimit?: number
  /**
   * ${1:Description placeholder}
   *
   * @type {?number}
   */
  duration?: number
  /**
   * ${1:Description placeholder}
   *
   * @type {?boolean}
   */
  enable_cache?: boolean
  /**
   * ${1:Description placeholder}
   *
   * @type {?number}
   */
  graceful_delay?: number
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  sentry_dsn?: string
  /**
   * ${1:Description placeholder}
   *
   * @type {?Runtime}
   */
  runtime?: Runtime
}

/**
 * ${1:Description placeholder}
 *
 * @export
 * @param {IConfig} config
 * @returns IConfig
 */
export function defineConfig(config: IConfig): IConfig {
  return config
}
