import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import config from './config'
import logger from './logger'
import { createServer } from './server'
import { captureException, environment, isProd } from './utils'

/**
 * Initializes Sentry and starts the server.
 *
 * - Sentry is configured only if the application is running in production.
 * - Server will listen on the port defined in the config.
 *
 * @async
 * @function main
 * @returns {Promise<void>} - Resolves when the server has started successfully.
 */
export async function main(): Promise<void> {
  try {
    // Initialize Sentry monitoring if in production environment
    Sentry.init({
      dsn: config.monitor_dsn as string,
      environment: environment(),
      enabled: isProd(),
      integrations: isProd() ? [nodeProfilingIntegration()] : [],
      tracesSampleRate: 1.0, // Capture all traces
      profilesSampleRate: 1.0, // Capture all profiles
    })

    // Create and start the server
    const server = createServer()
    server.listen(config.port)

    // Log server readiness and address information
    logger.ready('Server info:', server.address())
  }
  catch (error) {
    // Capture and log initialization errors
    captureException(`Error starting server: ${error}`)
  }
}

// Execute the main function, logging any unhandled rejections
main().catch(logger.error)
