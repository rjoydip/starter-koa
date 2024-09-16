import type Koa from 'koa'
import type { IRouter } from './types'
import { HttpMethodEnum } from 'koa-body'
import { safeParse } from 'valibot'
import { deleteUser, getUser, getUsers, isDBUp, setUser, updateUser } from './db'
import { UserSchema } from './schema'

export const routers: IRouter[] = [
  {
    name: 'Index',
    path: '/',
    method: HttpMethodEnum.GET,
    middleware: [],
    handler: async (ctx: Koa.Context) => {
      ctx.status = 200
      ctx.body = {
        message: 'Index',
        data: {},
        error: {},
      }
    },
  },
  {
    name: 'Status',
    path: '/status',
    method: HttpMethodEnum.GET,
    middleware: [],
    handler: async (ctx: Koa.Context) => {
      ctx.status = 200
      ctx.body = {
        message: 'Status',
        data: {
          status: 'up',
        },
        error: {},
      }
    },
  },
  {
    name: 'Health',
    path: '/health',
    method: HttpMethodEnum.GET,
    middleware: [],
    handler: async (ctx: Koa.Context) => {
      try {
        const _isDBUp = await isDBUp()
        ctx.status = 200
        ctx.body = {
          message: 'Health',
          data: {
            db: !!_isDBUp,
            redis: false,
          },
          error: {},
        }
      }
      catch (error: any) {
        ctx.status = 500
        ctx.body = {
          message: 'Fetch db details failed',
          data: {},
          error: {
            kind: 'response',
            type: 'string',
            message: error.message,
          },
        }
      }
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
        ctx.status = 200
        ctx.body = {
          message: 'All users',
          data: users,
          error: {},
        }
      }
      catch (error: any) {
        ctx.status = 500
        ctx.body = {
          message: 'Fetch users details failed',
          data: {},
          error: {
            kind: 'response',
            type: 'string',
            message: error.message,
          },
        }
      }
    },
  },
  {
    name: 'GetUser',
    path: '/user/:id',
    method: HttpMethodEnum.GET,
    middleware: [],
    handler: async (ctx: Koa.Context) => {
      try {
        const user = await getUser(ctx.params.id)
        if (user) {
          ctx.status = 200
          ctx.body = {
            message: 'User data',
            data: user,
            error: {},
          }
        }
        else {
          ctx.status = 422
          ctx.body = {
            message: 'User ID Not Valid',
            data: {},
            error: {
              kind: 'response',
              type: 'string',
              message: 'Invalid user id',
            },
          }
        }
      }
      catch (error: any) {
        ctx.status = 500
        ctx.body = {
          message: 'Fetch user details failed',
          data: {},
          error: {
            kind: 'response',
            type: 'string',
            message: error.message,
          },
        }
      }
    },
  },
  {
    name: 'PutUser',
    path: '/user/:id',
    method: HttpMethodEnum.PUT,
    middleware: [async (ctx: Koa.Context, next: Koa.Next) => {
      const _id = ctx.params.id
      try {
        const isValidUser = await getUser(_id)
        if (isValidUser) {
          await next()
        }
        else {
          ctx.status = 401
          ctx.body = {
            message: 'User Invalid',
            data: {},
            error: {},
          }
        }
      }
      catch (error: any) {
        ctx.status = 500
        ctx.body = {
          message: 'Fetch user details failed',
          data: {},
          error: {
            kind: 'response',
            type: 'string',
            message: error.message,
          },
        }
      }
    }],
    handler: async (ctx: Koa.Context) => {
      try {
        const user = await updateUser(ctx.params.id, ctx.request.body)
        ctx.status = 200
        ctx.body = {
          message: 'User updated successfully',
          data: user,
          error: {},
        }
      }
      catch (error: any) {
        ctx.status = 500
        ctx.body = {
          message: 'User updates failed',
          data: {},
          error: {
            kind: 'response',
            type: 'string',
            message: error.message,
          },
        }
      }
    },
  },
  {
    name: 'PostUser',
    path: '/user',
    method: HttpMethodEnum.POST,
    middleware: [async (ctx: Koa.Context, next: Koa.Next) => {
      const payload = ctx.request.body
      const result = safeParse(UserSchema, { _id: '', ...payload })
      if (result.success) {
        await next()
      }
      else {
        ctx.status = 422
        ctx.body = {
          message: 'User Invalid',
          data: {},
          error: result.issues,
        }
      }
    }],
    handler: async (ctx: Koa.Context) => {
      try {
        const payload = await setUser(ctx.request.body)
        ctx.status = 200
        ctx.body = {
          message: 'User stored successfully',
          data: payload,
          error: {},
        }
      }
      catch (error: any) {
        ctx.status = 500
        ctx.body = {
          message: 'User stored failed',
          data: {},
          error: {
            kind: 'response',
            type: 'string',
            message: error.message,
          },
        }
      }
    },
  },
  {
    name: 'DeleteUser',
    path: '/user/:id',
    method: HttpMethodEnum.DELETE,
    middleware: [async (ctx: Koa.Context, next: Koa.Next) => {
      try {
        const isValidUser = await getUser(ctx.params.id)
        if (isValidUser) {
          await next()
        }
        else {
          ctx.status = 401
          ctx.body = {
            message: 'User Invalid',
            data: {},
            error: {},
          }
        }
      }
      catch (error: any) {
        ctx.status = 500
        ctx.body = {
          message: 'Fetch user details failed',
          data: {},
          error: {
            kind: 'response',
            type: 'string',
            message: error.message,
          },
        }
      }
    }],
    handler: async (ctx: Koa.Context) => {
      try {
        const user = await deleteUser(ctx.params.id)
        ctx.status = 200
        ctx.body = {
          message: 'User delete successfully',
          data: user,
          error: {},
        }
      }
      catch (error: any) {
        ctx.status = 500
        ctx.body = {
          message: 'User delete failed',
          data: {},
          error: {
            kind: 'response',
            type: 'string',
            message: error.message,
          },
        }
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

  if (![HttpMethodEnum.GET, HttpMethodEnum.PATCH, HttpMethodEnum.POST, HttpMethodEnum.PUT, HttpMethodEnum.DELETE, HttpMethodEnum.HEAD].includes(router.method.toUpperCase())) {
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
