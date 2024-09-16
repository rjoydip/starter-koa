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

const port = config?.server?.port
const host = config?.server?.host

app.listen(port, async () => {
  logger.ready(`Server running on http://${host}:${port}`)
  await initDB()
})

process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error)
  Sentry.captureException(error)
  // Perform cleanup
  await dbDown()
  process.exit(1)
})

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  Sentry.captureException(reason)
  // Perform cleanup
  await dbDown()
  process.exit(1)
})

async function shutdownGracefully(): Promise<void> {
  logger.log('Shutting down server...')

  setTimeout(() => {
    logger.error('Forcing shutdown after timeout')
    Sentry.captureException('Shutting down server')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', shutdownGracefully)
process.on('SIGINT', shutdownGracefully)
