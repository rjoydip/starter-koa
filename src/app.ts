import type { IRouter } from './types'
import { loadavg } from 'node:os'
import { cpuUsage, memoryUsage } from 'node:process'
import { setupKoaErrorHandler } from '@sentry/node'
import { createYoga } from 'graphql-yoga'
import Koa from 'koa'
import { HttpMethodEnum, koaBody } from 'koa-body'
import helmet from 'koa-helmet'
import ratelimit from 'koa-ratelimit'
import Router from 'koa-router'
import config from '../app.config'
import { isDBUp } from './db'
import logger from './logger'
import { createError, createSuccess } from './message'
import { routers } from './routers'
import { schema } from './schema'
import { environment, getRegisteredRoutes, HTTP_STATUS_CODE } from './utils'

// Aapplication instances
const app = new Koa({
  asyncLocalStorage: false,
  env: environment(),
})
const graphqlApp = new Koa()
setupKoaErrorHandler(app)
const yoga = createYoga({
  landingPage: true,
  schema,
})
const whitelist = ['127.0.0.1']
const blacklist = ['192.168.0.*', '8.8.8.[0-3]']
const router = new Router()

/* External middleware - [START] */
app.use(helmet())
app.use(koaBody())
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

/* Internal middleware - [START] */
// GraphQL middleware
graphqlApp.use(async (ctx) => {
  const response = await yoga.handleNodeRequestAndResponse(ctx.req, ctx.res)
  ctx.status = response.status
  response.headers.forEach((value, key) => {
    ctx.append(key, value)
  })
  ctx.body = response.body
})
// IP middleware
app.use(async (ctx, next) => {
  const hostname = ctx.request.hostname
  let pass = true
  if (whitelist && Array.isArray(whitelist)) {
    pass = whitelist.some((item) => {
      return new RegExp(item).test(hostname)
    })
  }
  if (pass && blacklist && Array.isArray(blacklist)) {
    pass = !blacklist.some((item) => {
      return new RegExp(item).test(hostname)
    })
  }
  if (pass) {
    return await next()
  }
  ctx.throw(403)
  ctx.body = createSuccess({ message: 'Forbidden!!!' })
})
// Logger middleware
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  logger.debug(`> ${ctx.method} ${ctx.url} - ${ms}ms`)
  ctx.set('X-Response-Time', `${ms}ms`)
})
// Route matching middleware
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
/* Internal middleware - [END] */

// Custom routers
router
  .get('/', (ctx) => {
    ctx.status = HTTP_STATUS_CODE[200]
    ctx.body = createSuccess({ message: 'Welcome to Koa Starter' })
  })
  .get('/status', (ctx) => {
    ctx.status = HTTP_STATUS_CODE[200]
    ctx.body = createSuccess({
      message: 'Status',
      data: { status: 'up' },
    })
  })
  .get('/health', async (ctx) => {
    // const data = await cacheInstance.health()
    const _isDBUp = await isDBUp()
    const data = {
      db: _isDBUp,
      redis: false,
    }
    ctx.status = HTTP_STATUS_CODE[200]
    ctx.body = createSuccess({
      message: 'Health',
      data,
    })
  })
  .get('/metrics', (ctx) => {
    ctx.status = HTTP_STATUS_CODE[200]
    ctx.body = createSuccess({
      message: 'Metrics',
      data: {
        memoryUsage: memoryUsage(),
        cpuUsage: cpuUsage(),
        loadAverage: loadavg(),
      },
    })
  })

routers.forEach((r: IRouter) => {
  // TODO: Change it to dynamic method calling
  switch (r.method) {
    case HttpMethodEnum.GET:
      router.get(r.name, r.path, ...r.middleware, r.handler)
      break
    case HttpMethodEnum.POST:
      router.post(r.name, r.path, ...r.middleware, r.handler)
      break
    case HttpMethodEnum.PUT:
      router.put(r.name, r.path, ...r.middleware, r.handler)
      break
    case HttpMethodEnum.DELETE:
      router.delete(r.name, r.path, ...r.middleware, r.handler)
      break
  }
})

// Dispatch routes and allow OPTIONS request method
app.use(router.routes())
  .use(router.allowedMethods())

export { app, graphqlApp, router }
