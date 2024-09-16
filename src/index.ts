import type { Server } from 'node:http'

import process, { env } from 'node:process'
import * as Sentry from '@sentry/bun'
import config from '../app.config'
import { app } from './app'
import { dbDown, initDB } from './db'
import logger from './logger'

Sentry.init({
  dsn: env.SENTRY_DNS,
  tracesSampleRate: 1.0,
})

export async function startServer(): Promise<Server> {
  const port = config?.server?.port || 3000
  const server = app.listen(port, () => {
    logger.ready(`Server running on port ${port}`)
  })
  return server
}

process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error)
  Sentry.captureException(`Uncaught Exception: ${error}`)
  // Perform cleanup
  await dbDown()
  process.exit(1)
})

process.on('unhandledRejection', async (reason, promise) => {
  console.error(`Unhandled Rejection at: ${promise} reason: ${reason}`)
  Sentry.captureException(`Unhandled Rejection at: ${promise} reason: ${reason}`)
  // Perform cleanup
  await dbDown()
  process.exit(1)
})

async function shutdownGracefully(): Promise<void> {
  logger.log('Shutting down server...')

  setTimeout(() => {
    logger.error('Forcing shutdown after timeout')
    Sentry.captureException('Shutting down server (Forcing shutdow)')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', shutdownGracefully)
process.on('SIGINT', shutdownGracefully)

/* v8 ignore start */
if (require.main === module) {
  (async () => {
    try {
      await initDB()
      await startServer()
      logger.ready('Server started successfully')
    }
    catch (error: any) {
      logger.error('Error starting server', error)
      Sentry.captureException(`Error starting server: ${error}`)
    }
  })()
}
/* v8 ignore start */
