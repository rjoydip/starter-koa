import type { Context, Next } from 'koa'
import type { ZodSchema } from 'zod'
import type { IRouter } from './types.ts'
import { HttpMethodEnum } from 'koa-body'
import { createError } from './message.ts'
import { resolvers } from './resolvers.ts'
import { captureException, HTTP_STATUS_CODE } from './utils.ts'

/**
 * Middleware to validate the request body against a Zod schema.
 *
 * @export
 * @template T - The type of the schema.
 * @param {ZodSchema<T>} schema - The Zod schema to validate the request body against.
 * @returns {(ctx: Context, next: Next) => Promise<void>} The middleware function.
 */
export function requestValidator<T>(schema: ZodSchema<T>) {
  return async function (ctx: Context, next: Next): Promise<void> {
    if (ctx.request.body) {
      const result = schema.safeParse(ctx.request.body)
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
 * Middleware to validate the user based on the provided ID in the request parameters.
 *
 * @export
 * @returns {(ctx: Context, next: Next) => Promise<void>} The middleware function.
 */
export function userValidator() {
  return async function (ctx: Context, next: Next): Promise<void> {
    try {
      const user = await resolvers.Query.getUser(null, { id: ctx.params.id })
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
    catch (error) {
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
 * Validates the router object for necessary properties and valid HTTP method.
 *
 * @export
 * @param {(IRouter | null)} [router] - The router object to validate. Defaults to null.
 * @returns {boolean} True if the router is valid; otherwise, throws an error.
 * @throws {Error} If the router is invalid or any required properties are missing.
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

  if (
    ![
      HttpMethodEnum.GET,
      HttpMethodEnum.POST,
      HttpMethodEnum.PUT,
      HttpMethodEnum.DELETE,
    ].includes(router.method)
  ) {
    throw new Error('Router method must be a valid HTTP method')
  }

  if (!router.middleware || !Array.isArray(router.middleware)) {
    throw new Error('Router middleware must be an array')
  }

  return true
}
