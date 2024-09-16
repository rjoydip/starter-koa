import type { IRouter } from './types'
import Koa from 'koa'
import { koaBody } from 'koa-body'
import helmet from 'koa-helmet'
import ip from 'koa-ip'
import json from 'koa-json'
import ratelimit from 'koa-ratelimit'
import Router from 'koa-router'
import config from '../app.config'
import logger from './logger'
import { routers } from './routers'
import { getRegisteredRoutes } from './utils'

// Aapplication instances
const db = new Map()
const app = new Koa({
  asyncLocalStorage: false,
  env: config.app?.env?.NODE_ENV,
})
const router = new Router()

/* External middleware - [START] */
app.use(json({
  pretty: true,
  spaces: 2,
}))
app.use(helmet())
app.use(koaBody())
app.use(ip({
  whitelist: ['127.0.0.1'],
  blacklist: ['192.168.0.*', '8.8.8.[0-3]'],
  handler: async (ctx: Koa.Context) => {
    ctx.status = 422
    ctx.body = 'Forbidden!!!'
  },
}))
app.use(ratelimit({
  driver: 'memory',
  db,
  duration: config?.app?.ratelimit,
  errorMessage: 'Sometimes You Just Have to Slow Down.',
  id: (ctx: Koa.Context) => ctx.ip,
  headers: {
    remaining: 'Rate-Limit-Remaining',
    reset: 'Rate-Limit-Reset',
    total: 'Rate-Limit-Total',
  },
  max: 100,
  disableHeader: false,
}))
/* External middleware - [END] */

// Logger middleware
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  logger.debug(`> ${ctx.method} ${ctx.url} - ${ms}ms`)
  ctx.set('X-Response-Time', `${ms}ms`)
})

// Middleware to check if the incoming URL matches custom routes
app.use(async (ctx, next) => {
  const requestedUrl = ctx.request.path

  // Get all registered routes
  const registeredRoutes = getRegisteredRoutes(router)

  // Check if the requested URL matches any route regex pattern
  const hasMatchedRoutes = registeredRoutes.some(route => route.regexp.test(requestedUrl))

  if (!hasMatchedRoutes) {
    ctx.status = 404
    ctx.body = { message: 'Route Not Found' }
  }
  else {
    await next()
  }
})

// Authentication middleware
app.use(async (_, next) => {
  logger.debug('Authentication Middleware')
  await next()
})

// Custom routers
routers.forEach((r: IRouter) => {
  // TODO: Change it to dynamic method calling
  switch (r.method.toLowerCase()) {
    case 'get':
      router.get(r.name, r.path, ...r.middleware ?? [], r.handler)
      break
    case 'post':
      router.post(r.name, r.path, ...r.middleware ?? [], r.handler)
      break
    case 'put':
      router.put(r.name, r.path, ...r.middleware ?? [], r.handler)
      break
    case 'delete':
      router.delete(r.name, r.path, ...r.middleware ?? [], r.handler)
      break
  }
})

// Dispatch routes and allow OPTIONS request method
app.use(router.routes())
app.use(router.allowedMethods())

export { app, router }
export default app
