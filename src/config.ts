import type { IConfig, Services } from './types'
import defu from 'defu'
import { nodeENV, type RuntimeName } from 'std-env'

export function defineConfig(config?: IConfig): IConfig {
  return defu(config, {
    server: {
      host: 'localhost',
      port: 3000,
      isHTTPs: false,
    },
    app: {
      env: {
        NODE_ENV: nodeENV,
      },
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
