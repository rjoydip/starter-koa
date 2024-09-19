import type Koa from 'koa'
import type { IRouter } from './types'
import { HttpMethodEnum } from 'koa-body'
import { safeParse } from 'valibot'
import { HTTP_STATUS_CODE, MESSAGE } from './constants'
import { deleteUser, getUser, getUsers, isDBUp, setUser, updateUser } from './db'
import { UserSchema } from './schema'
import { captureException, errorResponse, successResponse } from './utils'

export function requestValidatorMiddleware(schema: any) {
  return async function (ctx: Koa.Context, next: Koa.Next): Promise<void> {
    if (!ctx.request.body) {
      ctx.status = HTTP_STATUS_CODE[422]
      ctx.body = errorResponse({
        message: 'Missing request data',
        status_code: HTTP_STATUS_CODE[422],
        error: { type: MESSAGE.MISSIG_REQUEST_DATA_ERROR, message: 'Missing request data' },
      })
    }
    else {
      const result = safeParse(schema, ctx.request.body)
      if (result.success) {
        await next()
      }
      else {
        ctx.status = HTTP_STATUS_CODE[422]
        ctx.body = errorResponse({
          message: 'Missing request data',
          status_code: HTTP_STATUS_CODE[422],
          error: { type: MESSAGE.USER_DATA_ERROR, message: 'Missing request data' },
        })
      }
    }
  }
}

export function userValidatorMiddleware() {
  return async function (ctx: Koa.Context, next: Koa.Next): Promise<void> {
    try {
      if (ctx.params.id) {
        const user = await getUser(ctx.params.id)
        if (user) {
          ctx.state.user = user
          await next()
        }
        else {
          ctx.status = HTTP_STATUS_CODE[422]
          ctx.body = errorResponse({
            message: 'User Invalid',
            status_code: HTTP_STATUS_CODE[422],
            error: { type: MESSAGE.AUTH_ERROR, message: 'User Invalid' },
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
      ctx.body = errorResponse({
        message: 'Update user details failed',
        error: { type: MESSAGE.DB_ERROR, message: error.message },
      })
      captureException(error)
    }
  }
}

export const routers: IRouter[] = [
  {
    name: 'Index',
    path: '/',
    method: HttpMethodEnum.GET,
    middleware: [],
    handler: async (ctx: Koa.Context) => {
      ctx.status = HTTP_STATUS_CODE[200]
      ctx.body = successResponse({ message: 'Index', data: {} })
    },
  },
  {
    name: 'Status',
    path: '/status',
    method: HttpMethodEnum.GET,
    middleware: [],
    handler: async (ctx: Koa.Context) => {
      ctx.status = HTTP_STATUS_CODE[200]
      ctx.body = successResponse({ message: 'Status', data: { status: 'up' } })
    },
  },
  {
    name: 'Health',
    path: '/health',
    method: HttpMethodEnum.GET,
    middleware: [],
    handler: async (ctx: Koa.Context) => {
      const _isDBUp = await isDBUp()
      ctx.status = HTTP_STATUS_CODE[200]
      ctx.body = successResponse({
        message: 'Health',
        data: { db: !!_isDBUp, redis: false },
      })
    },
  },
  {
    name: 'GetUsers',
    path: '/users',
    method: HttpMethodEnum.GET,
    middleware: [],
    handler: async (ctx: Koa.Context) => {
      try {
        const users = await getUsers()
        ctx.status = HTTP_STATUS_CODE[200]
        ctx.body = successResponse({
          message: 'Fetched all user details successfully',
          data: users,
        })
      }
      catch (error: any) {
        ctx.status = HTTP_STATUS_CODE[500]
        ctx.body = errorResponse({
          message: 'Fetched all users details failed',
          error: { type: MESSAGE.DB_ERROR, message: error.message },
        })
        captureException(error)
      }
    },
  },
  {
    name: 'GetUser',
    path: '/user/:id',
    method: HttpMethodEnum.GET,
    middleware: [userValidatorMiddleware()],
    handler: async (ctx: Koa.Context) => {
      const user = ctx.state.user
      ctx.status = HTTP_STATUS_CODE[200]
      ctx.body = successResponse({
        message: 'Fetched user details successfully',
        data: user,
      })
      ctx.state = undefined
    },
  },
  {
    name: 'PostUser',
    path: '/user',
    method: HttpMethodEnum.POST,
    middleware: [requestValidatorMiddleware(UserSchema), userValidatorMiddleware()],
    handler: async (ctx: Koa.Context) => {
      try {
        const payload = await setUser(ctx.request.body)
        ctx.status = HTTP_STATUS_CODE[200]
        ctx.body = successResponse({
          message: 'User details stored successfully',
          data: payload,
        })
      }
      catch (error: any) {
        ctx.status = HTTP_STATUS_CODE[500]
        ctx.body = errorResponse({
          message: 'User details stored failed',
          error: { type: MESSAGE.DB_ERROR, message: error.message },
        })
        captureException(error)
      }
    },
  },
  {
    name: 'PutUser',
    path: '/user/:id',
    method: HttpMethodEnum.PUT,
    middleware: [requestValidatorMiddleware(UserSchema), userValidatorMiddleware()],
    handler: async (ctx: Koa.Context) => {
      try {
        const user = await updateUser(ctx.params.id, ctx.request.body)
        ctx.status = HTTP_STATUS_CODE[200]
        ctx.body = successResponse({
          message: 'User details updates successfully',
          data: user,
        })
      }
      catch (error: any) {
        ctx.status = HTTP_STATUS_CODE[500]
        ctx.body = errorResponse({
          message: 'User details updates failed',
          error: { type: MESSAGE.DB_ERROR, message: error.message },
        })
        captureException(error)
      }
    },
  },
  {
    name: 'DeleteUser',
    path: '/user/:id',
    method: HttpMethodEnum.DELETE,
    middleware: [userValidatorMiddleware()],
    handler: async (ctx: Koa.Context) => {
      try {
        const user = await deleteUser(ctx.params.id)
        ctx.status = HTTP_STATUS_CODE[200]
        ctx.body = successResponse({ message: 'User delete successfully', data: user })
      }
      catch (error: any) {
        ctx.status = HTTP_STATUS_CODE[500]
        ctx.body = errorResponse({
          message: 'User data deletetion failed',
          error: { type: MESSAGE.DB_ERROR, message: error.message },
        })
        captureException(error)
      }
    },
  },
]

export function getRouter(route: string): IRouter | null {
  return routers.find(i => i.name.toLowerCase() === route.toLowerCase()) ?? null
}

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
