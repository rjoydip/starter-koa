import type { Context } from 'koa'
import type { IRouter } from './types'
import { setupKoaErrorHandler } from '@sentry/node'
import Koa from 'koa'
import { HttpMethodEnum, koaBody } from 'koa-body'
import helmet from 'koa-helmet'
import ip from 'koa-ip'
import ratelimit from 'koa-ratelimit'
import Router from 'koa-router'
import config from '../app.config'
import logger from './logger'
import { createError } from './message'
import { routers } from './routers'
import { environment, getRegisteredRoutes } from './utils'

// Aapplication instances
const app = new Koa({
  asyncLocalStorage: false,
  env: environment(),
})
const router = new Router()
setupKoaErrorHandler(app)

/* External middleware - [START] */
app.use(helmet())
app.use(koaBody())
app.use(ip({
  whitelist: ['127.0.0.1'],
  blacklist: ['192.168.0.*', '8.8.8.[0-3]'],
  handler: async (ctx: Context) => {
    ctx.status = 403
    ctx.body = createError({ status: 403, message: 'Forbidden!!!' })
  },
}))
app.use(ratelimit({
  driver: 'memory',
  db: new Map(),
  duration: config?.duration,
  errorMessage: 'Sometimes You Just Have to Slow Down.',
  id: (ctx: Koa.Context) => ctx.ip,
  headers: {
    remaining: 'Rate-Limit-Remaining',
    reset: 'Rate-Limit-Reset',
    total: 'Rate-Limit-Total',
  },
  max: config.ratelimit,
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
    ctx.body = createError({ status: 404, message: 'Route Not Found' })
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
  switch (r.method) {
    case HttpMethodEnum.GET:
      router.get(r.name, r.path, ...r.middleware ?? [], r.handler)
      break
    case HttpMethodEnum.POST:
      router.post(r.name, r.path, ...r.middleware ?? [], r.handler)
      break
    case HttpMethodEnum.PUT:
      router.put(r.name, r.path, ...r.middleware ?? [], r.handler)
      break
    case HttpMethodEnum.DELETE:
      router.delete(r.name, r.path, ...r.middleware ?? [], r.handler)
      break
  }
})

// Dispatch routes and allow OPTIONS request method
app.use(router.routes())
app.use(router.allowedMethods())

export { app, router }
export default app
