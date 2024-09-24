import type Koa from 'koa'
import type { IRouter } from './types'
import { HttpMethodEnum } from 'koa-body'
import { deleteUser, getUsers, setUser, updateUser } from './db'
import { createError, createSuccess } from './message'
import { UserSchema } from './schema'
import { captureException, HTTP_STATUS_CODE } from './utils'
import { requestValidator, userValidator } from './validator'

export const routers: IRouter[] = [
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
    middleware: [userValidator()],
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
    middleware: [requestValidator(UserSchema), userValidator()],
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
    middleware: [requestValidator(UserSchema), userValidator()],
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
    middleware: [userValidator()],
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
