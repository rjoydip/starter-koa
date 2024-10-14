import type { IRouter } from './types'
import Koa from 'koa'
import { HttpMethodEnum, koaBody } from 'koa-body'
import helmet from 'koa-helmet'
import ratelimit from 'koa-ratelimit'
import Router from 'koa-router'
import config from './config'
import logger from './logger'
import { createSuccess } from './message'
import { routers } from './routers'
import { environment, isProd } from './utils'

// Instances
const app = new Koa({
  env: environment(),
})
const router = new Router()
const whitelist = ['127.0.0.1']
const blacklist = ['192.168.0.*', '8.8.8.[0-3]']
const methodMap: Record<HttpMethodEnum, (r: IRouter) => Router<any, any>> = {
  [HttpMethodEnum.GET]: (r: IRouter) =>
    router.get(r.name, r.path, ...r.middleware, r.defineHandler),
  [HttpMethodEnum.POST]: (r: IRouter) =>
    router.post(r.name, r.path, ...r.middleware, r.defineHandler),
  [HttpMethodEnum.PUT]: (r: IRouter) =>
    router.put(r.name, r.path, ...r.middleware, r.defineHandler),
  /* v8 ignore next 2 */
  [HttpMethodEnum.PATCH]: (r: IRouter) =>
    router.patch(r.name, r.path, ...r.middleware, r.defineHandler),
  [HttpMethodEnum.DELETE]: (r: IRouter) =>
    router.delete(r.name, r.path, ...r.middleware, r.defineHandler),
  /* v8 ignore next 2 */
  [HttpMethodEnum.HEAD]: (r: IRouter) =>
    router.head(r.name, r.path, ...r.middleware, r.defineHandler),
}
/* External middleware - [START] */
app
  .use(helmet({
    contentSecurityPolicy: isProd(),
    crossOriginEmbedderPolicy: isProd(),
  }))
  .use(koaBody())
  .use(ratelimit({
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
app
  .use(async (ctx, next) => { // IP
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
  .use(async (ctx, next) => { // Logger
    const start = Date.now()
    await next()
    const ms = Date.now() - start
    logger.debug(`> ${ctx.method} ${ctx.url} - ${ms}ms`)
    ctx.set('X-Response-Time', `${ms}ms`)
  })
  .use(async (ctx, next) => { // 404 response
    await next()
    if (ctx.status === 404) {
      ctx.throw(404)
    }
  })
  .use(async (_, next) => { // Authentication
    logger.debug('Authentication Middleware')
    await next()
  })
/* Internal middleware - [END] */

// Custom routers
routers.forEach((r: IRouter) => methodMap[r.method](r))
// Dispatch routes and allow OPTIONS request method
app
  .use(router.routes())
  .use(router.allowedMethods())

export { app }
