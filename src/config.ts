import type { RuntimeName } from 'std-env'
import type { IConfig, Services } from './types'
import defu from 'defu'

export function defineConfig(config?: IConfig): IConfig {
  return defu(config, {
    server: {
      host: 'localhost',
      port: 3000,
    },
    app: {
      env: {},
      log_level: 3,
      services: ['db', 'redis'] as Services[],
      ratelimit: 60000,
    },
    system: {
      platform: 'aix' as NodeJS.Platform,
      runtime: 'bun' as RuntimeName,
    },
  })
}
