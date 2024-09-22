import type Koa from 'koa'
import type { IRouter } from './types'
import { HttpMethodEnum } from 'koa-body'
import { safeParse } from 'valibot'
import { deleteUser, getUser, getUsers, isDBUp, setUser, updateUser } from './db'
import { createError, createSuccess } from './message'
import { UserSchema } from './schema'
import { captureException, HTTP_STATUS_CODE } from './utils'

export function requestValidatorMiddleware(schema: any) {
  return async function (ctx: Koa.Context, next: Koa.Next): Promise<void> {
    if (!ctx.request.body) {
      ctx.status = HTTP_STATUS_CODE[422]
      ctx.body = createError({
        message: 'Missing request data',
        status: HTTP_STATUS_CODE[422],
        data: {},
      })
    }
    else {
      const result = safeParse(schema, ctx.request.body)
      if (result.success) {
        await next()
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

export const routers: IRouter[] = [
  {
    name: 'Welcome',
    path: '/',
    method: HttpMethodEnum.GET,
    middleware: [],
    handler: async (ctx: Koa.Context) => {
      ctx.status = HTTP_STATUS_CODE[200]
      ctx.body = createSuccess({ message: 'Welcome to Koa Starter' })
    },
  },
  {
    name: 'Status',
    path: '/status',
    method: HttpMethodEnum.GET,
    middleware: [],
    handler: async (ctx: Koa.Context) => {
      ctx.status = HTTP_STATUS_CODE[200]
      ctx.body = createSuccess({ message: 'Status', data: { status: 'up' } })
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
      ctx.body = createSuccess({
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
        ctx.body = createSuccess({
          status: HTTP_STATUS_CODE[200],
          message: 'Fetched all user details successfully',
          data: users,
        })
      }
      catch (error: any) {
        ctx.status = HTTP_STATUS_CODE[500]
        ctx.body = createError({
          status: HTTP_STATUS_CODE[500],
          message: 'Fetched all users details failed',
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
      ctx.body = createSuccess({
        message: 'Fetched user details successfully',
        status: HTTP_STATUS_CODE[200],
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
        ctx.body = createSuccess({
          message: 'User details stored successfully',
          data: payload,
        })
      }
      catch (error: any) {
        ctx.status = HTTP_STATUS_CODE[500]
        ctx.body = createError({
          message: 'User details stored failed',
          status: HTTP_STATUS_CODE[500],
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
        ctx.body = createSuccess({
          message: 'User details updates successfully',
          status: HTTP_STATUS_CODE[200],
          data: user,
        })
      }
      catch (error: any) {
        ctx.status = HTTP_STATUS_CODE[500]
        ctx.body = createError({
          message: 'User details updates failed',
          status: HTTP_STATUS_CODE[500],
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
        await deleteUser(ctx.params.id)
        ctx.status = HTTP_STATUS_CODE[200]
        ctx.body = createSuccess({ message: 'User delete successfully', data: ctx.state.user })
      }
      catch (error: any) {
        ctx.status = HTTP_STATUS_CODE[500]
        ctx.body = createError({
          message: 'User data deletetion failed',
          status: HTTP_STATUS_CODE[500],
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
