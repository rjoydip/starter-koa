import type { IRouter, TApplication } from './types.ts'
import Koa from 'koa'
import { HttpMethodEnum, koaBody } from 'koa-body'
import helmet from 'koa-helmet'
import ratelimit from 'koa-ratelimit'
import Router from 'koa-router'
import config from './config.ts'
import logger from './logger.ts'
import { createSuccess } from './message.ts'
import { routers } from './routers.ts'
import { defineTRPCHandler } from './trpc.ts'
import { API_PREFIX, environment, isProd } from './utils.ts'

/**
 * Creates and configures a new Koa application instance.
 *
 * This function initializes a Koa app with security, rate limiting, and body parsing middleware.
 * It also sets up custom routing and request handling, including IP-based access control
 * and logging.
 *
 * @export
 * @param {TApplication} [_] - Optional application configuration parameter (unused).
 * @returns {Koa} Configured Koa application instance.
 */
export function createApplication(_?: TApplication): Koa {
  // Initialize Koa application with the current environment setting
  const app = new Koa({
    env: environment(),
  })

  // Initialize a new router instance
  const router = new Router()

  // IP-based whitelisting and blacklisting rules for request origin control
  const whitelist = ['127.0.0.1']
  const blacklist = ['192.168.0.*', '8.8.8.[0-3]']

  // Mapping HTTP methods to router handling logic
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

  // External middleware setup [START]
  app
    .use(
      helmet({
        contentSecurityPolicy: isProd(),
        crossOriginEmbedderPolicy: isProd(),
      }),
    )
    .use(koaBody())
    .use(
      ratelimit({
        driver: 'memory',
        db: new Map(),
        duration: config?.duration,
        errorMessage: 'Please slow down your requests.',
        id: (ctx: Koa.Context) => ctx.ip,
        headers: {
          remaining: 'Rate-Limit-Remaining',
          reset: 'Rate-Limit-Reset',
          total: 'Rate-Limit-Total',
        },
        max: config.ratelimit,
        disableHeader: false,
      }),
    )
  // External middleware setup [END]

  // Internal middleware setup [START]
  app
    .use(async (ctx, next) => {
      // IP whitelisting and blacklisting middleware
      const hostname = ctx.request.hostname
      let pass = whitelist.some(item => new RegExp(item).test(hostname))
      if (pass) {
        pass = !blacklist.some(item => new RegExp(item).test(hostname))
      }
      if (pass) {
        return await next()
      }
      ctx.throw(403)
      ctx.body = createSuccess({ message: 'Access Denied!' })
    })
    .use(async (ctx, next) => {
      // Logging middleware with request time measurement
      const start = Date.now()
      await next()
      const ms = Date.now() - start
      logger.debug(`> ${ctx.method} ${ctx.url} - ${ms}ms`)
      ctx.set('X-Response-Time', `${ms}ms`)
    })
    .use(async (ctx, next) => {
      // 404 response middleware for unmatched routes
      await next()
      if (ctx.status === 404) {
        ctx.throw(404)
      }
    })
    .use(async (_, next) => {
      // Placeholder authentication middleware
      logger.debug('Authentication check middleware')
      await next()
    })
    .use(async (ctx, next) => {
      // tRPC integration for API requests to '/api/trpc' endpoint
      await next()
      if (ctx.req.url!.startsWith(`/${API_PREFIX}/trpc`)) {
        ctx.status = 200
        ctx.req.url = ctx.req.url!.replace(`/${API_PREFIX}/trpc`, '')
        await defineTRPCHandler(ctx.req, ctx.res)
      }
    })
  // Internal middleware setup [END]

  // Apply routers from configuration
  routers.forEach((r: IRouter) => methodMap[r.method](r))

  // Route handling configuration with OPTIONS support
  app.use(router.routes()).use(router.allowedMethods())

  return app
}
