import type { Server } from 'node:http'
import http from 'node:http'
import https from 'node:https'
import closeWithGrace from 'close-with-grace'
import { createApplication } from './app.ts'
import config from './config.ts'
import logger from './logger.ts'
import { captureException } from './utils.ts'
import { ws } from './ws.ts'

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
  /* v8 ignore start */
  const server = config?.isHTTPs
    ? https.createServer(app.callback())
    : http.createServer(app.callback())
  /* v8 ignore stop */

  server
    .on('upgrade', ws.handleUpgrade)
    .on('error', () => {
      ws.closeAll()
      handleGracefulShutdown(server)
    })
    .on('close', () => ws.closeAll())

  return server
}
