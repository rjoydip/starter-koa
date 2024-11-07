import type { Server } from 'node:http'
import type { IConfig } from './config.ts'
import http from 'node:http'
import https from 'node:https'
import closeWithGrace from 'close-with-grace'
import { createYoga } from 'graphql-yoga'
import { createApplication } from './app.ts'
import config from './config.ts'
import logger from './logger.ts'
import { graphqlSchema } from './schema.ts'
import { API_PREFIX, captureException } from './utils.ts'
import { ws } from './ws.ts'

export function getServerInstance(config: IConfig) {
  return (app: any) => {
    return config?.isHTTPs ? https.createServer(app) : http.createServer(app)
  }
}

/**
 * Handles graceful shutdown of the server.
 *
 * @param {Server} server - The HTTP/HTTPS server to close gracefully.
 * @returns {void}
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

/**
 * Creates and returns an HTTP/HTTPS server instance.
 *
 * @returns {Server} The created HTTP/HTTPS server.
 */
export function createServer(): Server {
  const app = createApplication()
  const server = getServerInstance(config)(app.callback())

  server
    .on('upgrade', ws.handleUpgrade)
    .on('error', () => handleGracefulShutdown(server))
    .on('close', () => ws.closeAll())

  return server
}

/**
 * Creates and returns an HTTP/HTTPS grahql server instance.
 *
 * @returns {Server} The created HTTP/HTTPS server.
 */
export function createGraphQLServer(): Server {
  const yoga = createYoga({
    graphqlEndpoint: `/${API_PREFIX}/graphql`,
    schema: graphqlSchema(),
  })
  return getServerInstance(config)(yoga)
}
