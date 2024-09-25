import type { Context, Next } from 'koa'
import type { IRouter } from './types'
import { HttpMethodEnum } from 'koa-body'
import { safeParse } from 'valibot'
import { getUser } from './db'
import { createError } from './message'
import { captureException, HTTP_STATUS_CODE } from './utils'

/**
 * ${1:Description placeholder}
 *
 * @export
 * @param {${2:*}} schema
 * @returns (ctx: Context, next: Next) => Promise<void>
 */
export function requestValidator(schema: any) {
  return async function (ctx: Context, next: Next): Promise<void> {
    if (ctx.request.body) {
      const result = safeParse(schema, ctx.request.body)
      if (result.success) {
        await next()
      }
      else {
        ctx.status = HTTP_STATUS_CODE[422]
        ctx.body = createError({
          message: 'Invalid request data',
          status: HTTP_STATUS_CODE[422],
        })
      }
    }
    else {
      ctx.status = HTTP_STATUS_CODE[422]
      ctx.body = createError({
        message: 'Missing request data',
        status: HTTP_STATUS_CODE[422],
      })
    }
  }
}

/**
 * ${1:Description placeholder}
 *
 * @export
 * @returns (ctx: Context, next: Next) => Promise<void>
 */
export function userValidator() {
  return async function (ctx: Context, next: Next): Promise<void> {
    try {
      if (ctx.params && ctx.params.id) {
        const user = await getUser(ctx.params.id)
        if (user) {
          ctx.state.user = user
          await next()
        }
        else {
          ctx.status = HTTP_STATUS_CODE[422]
          ctx.body = createError({
            message: 'User Invalid',
            status: HTTP_STATUS_CODE[422],
          })
          captureException('User Invalid')
        }
      }
      else {
        await next()
      }
    }
    catch (error: any) {
      ctx.status = HTTP_STATUS_CODE[500]
      ctx.body = createError({
        message: 'Update user details failed',
        status: HTTP_STATUS_CODE[500],
      })
      captureException(error)
    }
  }
}

/**
 * ${1:Description placeholder}
 *
 * @export
 * @param {(IRouter | null)} [router]
 * @returns boolean
 */
export function validateRouter(router: IRouter | null = null): boolean {
  if (!router) {
    throw new Error('Router is empty')
  }

  if (!router.name) {
    throw new Error('Router name must be a non-empty string')
  }

  if (!router.path) {
    throw new Error('Router path must be a non-empty string')
  }

  if (![HttpMethodEnum.GET, HttpMethodEnum.PATCH, HttpMethodEnum.POST, HttpMethodEnum.PUT, HttpMethodEnum.DELETE, HttpMethodEnum.HEAD].includes(router.method)) {
    throw new Error('Router method must be a valid HTTP method')
  }

  if (!router.handler || typeof router.handler !== 'function') {
    throw new Error('Router handler must be a function')
  }

  if (!router.middleware && !Array.isArray(router.middleware)) {
    throw new Error('Router middleware must be an array')
  }

  return true
}
