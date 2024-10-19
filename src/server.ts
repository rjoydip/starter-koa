import type { Server } from 'node:http'
import http from 'node:http'
import https from 'node:https'
import closeWithGrace from 'close-with-grace'
import { app } from './app.ts'
import config from './config.ts'
import logger from './logger.ts'
import { captureException } from './utils.ts'
import { ws } from './ws.ts'

/**
 * @export
 * @sync
 * @param {Server} server
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
 * @export
 * @returns Server
 */
export function createServer(): Server {
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
