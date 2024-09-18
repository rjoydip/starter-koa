import type { Server } from 'node:http'
import http from 'node:http'
import https from 'node:https'
import process, { env } from 'node:process'
import { setTimeout } from 'node:timers/promises'
import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import { isProduction } from 'std-env'
import config from '../app.config'
import { app } from './app'
import { initDB } from './db'
import logger from './logger'
import { captureException, environment, isTest } from './utils'

export async function startServer(): Promise<Server> {
  const port = config?.server?.port || 3000
  const isHTTPs = config?.server?.isHTTPs || false
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

export async function shutdownGracefully(): Promise<void> {
  logger.log('Shutting down server...')
  /* v8 ignore start */
  await setTimeout(1000, () => {
    logger.error('Forcing shutdown after timeout')
    captureException('Shutting down server (Forcing shutdow)')
    !isTest() && process.exit(1)
  })
  /* v8 ignore stop */
}

process.on('uncaughtException', async (error) => {
  logger.error(`Uncaught Exception: ${error}`)
  captureException(`Uncaught Exception: ${error}`)
})

process.on('SIGTERM', shutdownGracefully)
process.on('SIGINT', shutdownGracefully)

/* v8 ignore start */
; (async () => {
  try {
    Sentry.init({
      dsn: env.SENTRY_DNS,
      environment: environment(),
      enabled: isProduction,
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
    logger.error('Error starting server', error)
  }
})()
/* v8 ignore stop */
