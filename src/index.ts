import type { Server } from 'node:http'
import http from 'node:http'
import https from 'node:https'
import process, { env } from 'node:process'
import { init } from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import config from '../app.config'
import { app } from './app'
import { initDB } from './db'
import logger from './logger'
import { captureException, environment, isProd, isTest } from './utils'

export async function startServer(): Promise<Server> {
  const port = config?.port || 3000
  const isHTTPs = config?.isHTTPs || false
  /* v8 ignore start */
  const serverInstace = isHTTPs
    ? https.createServer(app.callback())
    : http.createServer(app.callback())
  /* v8 ignore stop */
  const server = serverInstace.listen(port, () => {
    logger.ready(`Server running on port ${port}`)
  })
  return server
}

export function shutdownGracefully(): void {
  /* v8 ignore start */
  captureException('Shutting down server (Forcing shutdown)')
  !isTest() && process.exit(1)
  /* v8 ignore stop */
}

process.on('uncaughtException', async (error) => {
  captureException(`Uncaught Exception: ${error}`)
  captureException(`Uncaught Exception: ${error}`)
  !isTest() && process.exit(1)
})

process.on('SIGTERM', shutdownGracefully)
process.on('SIGINT', shutdownGracefully)

/* v8 ignore start */
; (async () => {
  try {
    init({
      dsn: env.SENTRY_DNS,
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
  }
  catch (error: any) {
    captureException(`Error starting server: ${error}`)
  }
})()
/* v8 ignore stop */
