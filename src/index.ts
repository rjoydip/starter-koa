import type { Server } from 'node:http'
import http from 'node:http'
import https from 'node:https'
import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import closeWithGrace from 'close-with-grace'
import { app } from './app'
import config from './config'
import logger from './logger'
import { captureException, environment, isProd } from './utils'
import { ws } from './ws'

const port = config?.port

/**
 * @export
 * @returns Server
 */
export function startServer(): Server {
  /* v8 ignore start */
  const server = config?.isHTTPs
    ? https.createServer(app.callback())
    : http.createServer(app.callback())
  /* v8 ignore stop */

  server.listen(port)

  server.on('upgrade', ws.handleUpgrade)
  server.on('error', () => ws.closeAll())

  logger.ready(`Server running on port ${port}`)
  return server
}

/**
 * @export
 */
export function handleGracefulShutdown(server: Server): void {
  closeWithGrace(
    {
      delay: config.graceful_delay,
    },
    ({ err }) => {
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
    const server = await startServer()
    handleGracefulShutdown(server)
  }
  catch (error) {
    captureException(`Error starting server: ${error}`)
  }
}

main().catch(logger.error)
/* v8 ignore stop */
