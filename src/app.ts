import type { IRouter } from './types'
import { setupKoaErrorHandler } from '@sentry/node'
import { createYoga } from 'graphql-yoga'
import Koa from 'koa'
import { HttpMethodEnum, koaBody } from 'koa-body'
import helmet from 'koa-helmet'
import ratelimit from 'koa-ratelimit'
import Router from 'koa-router'
import config from './config'
import logger from './logger'
import { createSuccess } from './message'
import resolvers from './resolvers'
import { routers } from './routers'
import { schema } from './schema'
import { environment, HTTP_STATUS_CODE } from './utils'

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
const apiRouter = new Router({
  prefix: '/api',
})
const appRouter = new Router()

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

// Authentication middleware
app.use(async (_, next) => {
  logger.debug('Authentication Middleware')
  await next()
})
/* Internal middleware - [END] */

// Custom routers
appRouter
  .get('/', (ctx) => {
    ctx.status = HTTP_STATUS_CODE[200]
    ctx.body = createSuccess(resolvers.Query.index())
  })
  .get('/status', (ctx) => {
    ctx.status = HTTP_STATUS_CODE[200]
    ctx.body = createSuccess(resolvers.Query.status())
  })
  .get('/health', async (ctx) => {
    const payload = await resolvers.Query.health()
    ctx.status = HTTP_STATUS_CODE[200]
    ctx.body = createSuccess(payload)
  })
  .get('/metrics', (ctx) => {
    const payload = resolvers.Query.metrics()
    ctx.status = HTTP_STATUS_CODE[200]
    ctx.body = createSuccess(payload)
  })

routers.forEach((r: IRouter) => {
  // TODO: Change it to dynamic method calling
  switch (r.method) {
    case HttpMethodEnum.GET:
      apiRouter.get(r.name, r.path, ...r.middleware, r.handler)
      break
    case HttpMethodEnum.POST:
      apiRouter.post(r.name, r.path, ...r.middleware, r.handler)
      break
    case HttpMethodEnum.PUT:
      apiRouter.put(r.name, r.path, ...r.middleware, r.handler)
      break
    case HttpMethodEnum.DELETE:
      apiRouter.delete(r.name, r.path, ...r.middleware, r.handler)
      break
  }
})
app.use(async (ctx, next) => {
  try {
    await next()
    if (ctx.status === 404) {
      ctx.throw(404)
    }
  }
  catch (error: any) {
    ctx.throw(error)
  }
})
// Dispatch routes and allow OPTIONS request method
app.use(appRouter.routes())
app.use(apiRouter.routes())
  .use(apiRouter.allowedMethods())

export { apiRouter, app, appRouter, graphqlApp }
