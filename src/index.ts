import type { Server } from 'node:http'
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
  const server = app.listen(port, () => {
    logger.ready(`Server running on port ${port}`)
  })
  return server
}

async function shutdownGracefully(): Promise<void> {
  logger.log('Shutting down server...')
  await setTimeout(10000, () => {
    logger.error('Forcing shutdown after timeout')
    captureException('Shutting down server (Forcing shutdow)')
    !isTest() && process.exit(1)
  })
}

process.on('uncaughtException', async (error) => {
  logger.error(`Uncaught Exception: ${error}`)
  captureException(`Uncaught Exception: ${error}`)
  !isTest() && process.exit(1)
})

/* process.on('unhandledRejection', async (reason, promise: Promise<unknown>) => {
  logger.error(`Unhandled Rejection at: ${await promise.catch(e => e)} reason: ${reason}`)
  captureException(`Unhandled Rejection at: ${await promise.catch(e => e)} reason: ${reason}`)
  process.exit(1)
}) */

process.on('SIGTERM', shutdownGracefully)
process.on('SIGINT', shutdownGracefully)

/* v8 ignore start */
;(async () => {
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
/* v8 ignore start */
