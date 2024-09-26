import type { Server } from 'node:http'
import http from 'node:http'
import https from 'node:https'
import { init } from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import closeWithGrace from 'close-with-grace'
import config from '../app.config'
import { app, graphqlApp } from './app'
import { initDB } from './db'
import logger from './logger'
import { captureException, environment, isProd } from './utils'

const port = config?.port
const graphqlPort = config?.graphql_port

/**
 * ${1:Description placeholder}
 *
 * @export
 * @returns Server
 */
export function startServer(): { appServer: Server, graphqlServer: Server } {
  /* v8 ignore start */
  const appServer = config?.isHTTPs
    ? https.createServer(app.callback())
    : http.createServer(app.callback())

  const graphqlServer = config?.isHTTPs
    ? https.createServer(graphqlApp.callback())
    : http.createServer(graphqlApp.callback())
  /* v8 ignore stop */

  appServer.listen(port)
  graphqlServer.listen(graphqlPort)

  logger.ready(`Server running on port ${port}`)
  logger.ready(`GraphQL server running on port ${graphqlPort}`)
  return { appServer, graphqlServer }
}

/**
 * ${1:Description placeholder}
 *
 * @export
 */
export function handleGracefulShutdown({ appServer, graphqlServer }: { appServer: Server, graphqlServer: Server }): void {
  closeWithGrace(
    {
      delay: config.graceful_delay,
    },
    async ({ err }) => {
      logger.error(`[close-with-grace] ${err}`)
      if (err) {
        captureException(err)
      }
      appServer.close()
      graphqlServer.close()
    },
  )
}

/* v8 ignore start */
/**
 * ${1:Description placeholder}
 *
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
    const { appServer, graphqlServer } = await startServer()
    handleGracefulShutdown({ appServer, graphqlServer })
  }
  catch (error: any) {
    captureException(`Error starting server: ${error}`)
  }
}

main()
/* v8 ignore stop */
