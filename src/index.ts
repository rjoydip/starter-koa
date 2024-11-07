import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import pify from 'pify'
import config from './config'
import logger from './logger'
import { createGraphQLServer, createServer } from './server'
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

    // Create server instances
    const server = createServer()
    const graphqlServer = createGraphQLServer()

    // Listen server instances
    await pify(server.listen(config.port))
    await pify(graphqlServer.listen(config.port + 1))

    // Log server readiness and address information
    logger.ready('HTTP/HTTPs server info:', server.address())
    logger.ready('GraphQL server info:', graphqlServer.address())
  }
  catch (error) {
    // Capture and log initialization errors
    captureException(`Error starting server: ${error}`)
  }
}

// Execute the main function, logging any unhandled rejections
main().catch(logger.error)
