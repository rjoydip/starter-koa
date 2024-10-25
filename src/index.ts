import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import config from './config.ts'
import logger from './logger.ts'
import { createServer } from './server.ts'
import { captureException, environment, isProd } from './utils.ts'

/* v8 ignore start */
/**
 * @async
 * @returns {Promise<void>}
 */
export async function main(): Promise<void> {
  try {
    Sentry.init({
      dsn: config.monitor_dsn!,
      environment: environment(),
      enabled: isProd(),
      integrations: isProd()
        ? [
            nodeProfilingIntegration(),
          ]
        : [],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    })
    const server = createServer()
    server.listen(config.port)
    logger.ready('Server info: ', server.address())
  }
  catch (error) {
    captureException(`Error starting server: ${error}`)
  }
}

main().catch(logger.error)
/* v8 ignore stop */
