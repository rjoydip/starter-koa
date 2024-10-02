import type { Server } from 'node:http'
import http from 'node:http'
import https from 'node:https'
import { init } from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import closeWithGrace from 'close-with-grace'
import { app } from './app'
import config from './config'
import { initDB } from './db'
import logger from './logger'
import { captureException, environment, isProd } from './utils'

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
    init({
      dsn: config.sentry_dsn,
      environment: environment(),
      enabled: isProd(),
      integrations: [
        nodeProfilingIntegration(),
      ],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    })
    await initDB()
    const server = await startServer()
    handleGracefulShutdown(server)
  }
  catch (error: any) {
    captureException(`Error starting server: ${error}`)
  }
}

main()
/* v8 ignore stop */
