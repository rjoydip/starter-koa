import type { LogLevel } from 'consola'
import type { RuntimeName } from 'std-env'
import type { Services } from './types'

export interface IConfig {
  host?: string
  port?: number
  isHTTPs?: boolean
  log_level?: LogLevel
  services?: Services[]
  ratelimit?: number
  duration?: number
  enable_cache?: boolean
  graceful_delay?: number
  sentry_dsn?: string
  system: {
    platform: NodeJS.Platform
    runtime: RuntimeName
  }
}

export function defineConfig(config: IConfig): IConfig {
  return config
}
