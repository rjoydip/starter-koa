import type { Server } from 'node:http'
import type { IConfig } from './config.ts'
import http from 'node:http'
import https from 'node:https'
import { createYoga } from 'graphql-yoga'
import { createApplication } from './app.ts'
import config from './config.ts'
import { graphqlSchema } from './schema.ts'
import { API_PREFIX, captureException, createCertificate } from './utils.ts'
import { ws } from './ws.ts'

export function getServerInstance(config: IConfig) {
  const pems = createCertificate('starter-koa', config.cert_days)

  const options = {
    key: pems.private,
    cert: pems.cert,
  }

  return (app: any) => {
    return config?.isHTTPs ? https.createServer(options, app) : http.createServer(app)
  }
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
    .on('error', () => captureException(server))
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
