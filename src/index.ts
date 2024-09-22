import type { Server } from 'node:http'
import http from 'node:http'
import https from 'node:https'
import { init } from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import closeWithGrace from 'close-with-grace'
import config from '../app.config'
import { app } from './app'
import { initDB } from './db'
import logger from './logger'
import { captureException, environment, isProd } from './utils'

let server: Server

export function startServer(): Server {
  const port = config?.port
  /* v8 ignore next 3 */
  server = config?.isHTTPs
    ? https.createServer(app.callback())
    : http.createServer(app.callback())
  server.listen(port)
  logger.ready(`Server running on port ${port}`)
  return server
}

export function handleGracefulShutdown(): void {
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
; (async () => {
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
    await startServer()
    handleGracefulShutdown()
  }
  catch (error: any) {
    captureException(`Error starting server: ${error}`)
  }
})()
/* v8 ignore stop */
