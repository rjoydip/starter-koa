import type { LogLevel } from 'consola'
import { env, platform, runtime } from 'std-env'
import { defineConfig } from './src/config'

const { LOG_LEVEL = 3, PORT, HOST, RATE_LIMIT } = env

export default defineConfig({
  server: {
    port: Number(PORT),
    host: HOST,
  },
  app: {
    env,
    ratelimit: Number(RATE_LIMIT),
    log_level: LOG_LEVEL as LogLevel,
  },
  system: {
    platform,
    runtime,
  },
})
