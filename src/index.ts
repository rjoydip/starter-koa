import type { Server } from 'node:http'
import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import closeWithGrace from 'close-with-grace'
import { cache } from './cache'
import config from './config'
import logger from './logger'
import { createServer } from './server'
import { captureException, environment, isProd } from './utils'

/**
 * @export
 * @sync
 * @param {Server} server
 */
export function handleGracefulShutdown(server: Server): void {
  closeWithGrace(
    {
      delay: config.graceful_delay,
    },
    async ({ err }) => {
      logger.error(`[close-with-grace] ${err}`)
      if (err) {
        captureException(err)
      }
      server.close()
    },
  )
}

/* v8 ignore start */
/**
 * @async
 * @returns {Promise<void>}
 */
async function main(): Promise<void> {
  try {
    Sentry.init({
      dsn: config.monitor_dsn!,
      environment: environment(),
      enabled: isProd(),
      integrations: [
        nodeProfilingIntegration(),
      ],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    })
    const server = createServer()
    server.listen(config.port)
    cache.on('error', async (err) => {
      await cache.clear()
      logger.error(err)
      captureException(err)
    })
    handleGracefulShutdown(server)
  }
  catch (error) {
    captureException(`Error starting server: ${error}`)
  }
}

main().catch(logger.error)
/* v8 ignore stop */
