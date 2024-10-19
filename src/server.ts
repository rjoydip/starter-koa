import type { Server } from 'node:http'
import http from 'node:http'
import https from 'node:https'
import { app } from './app'
import config from './config'
import logger from './logger'
import { ws } from './ws'

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
    .on('error', () => ws.closeAll())
    .on('close', () => ws.closeAll())

  logger.ready(`Server running on port ${server.address()}`)
  return server
}
