import type Koa from 'koa'
import type { IRouter } from './types'
import { parseYAML } from 'confbox/yaml'
import { createYoga } from 'graphql-yoga'
import { HttpMethodEnum } from 'koa-body'
import { schema } from './db'
import { createError, createSuccess } from './message'
import resolvers from './resolvers'
import { apiDocs } from './scalar'
import { UserSchema } from './schema'
import { API_PREFIX, captureException, getOpenAPISpec, HTTP_STATUS_CODE } from './utils'
import { requestValidator, userValidator } from './validator'

const yoga = createYoga({
  landingPage: true,
  schema,
})
const { Query, Mutation } = resolvers

/**
 * Main application routes
 * @type {IRouter[]}
 */
const mainRoutes: IRouter[] = [
  {
    name: 'Index',
    path: '/',
    method: HttpMethodEnum.GET,
    middleware: [],
    defineHandler: async (ctx: Koa.Context) => {
      ctx.status = HTTP_STATUS_CODE[200]
      ctx.body = createSuccess(resolvers.Query.index())
    },
  },
  {
    name: 'Status',
    path: '/status',
    method: HttpMethodEnum.GET,
    middleware: [],
    defineHandler: async (ctx: Koa.Context) => {
      ctx.status = HTTP_STATUS_CODE[200]
      ctx.body = createSuccess(resolvers.Query.status())
    },
  },
  {
    name: 'Health',
    path: '/health',
    method: HttpMethodEnum.GET,
    middleware: [],
    defineHandler: async (ctx: Koa.Context) => {
      const payload = await resolvers.Query.health()
      ctx.status = HTTP_STATUS_CODE[200]
      ctx.body = createSuccess(payload)
    },
  },
  {
    name: 'Metrics',
    path: '/metrics',
    method: HttpMethodEnum.GET,
    middleware: [],
    defineHandler: async (ctx: Koa.Context) => {
      const payload = await resolvers.Query.metrics()
      ctx.status = HTTP_STATUS_CODE[200]
      ctx.body = createSuccess(payload)
    },
  },
  {
    name: 'OpenAPI',
    path: '/openapi',
    method: HttpMethodEnum.GET,
    middleware: [],
    defineHandler: async (ctx: Koa.Context) => {
      ctx.status = HTTP_STATUS_CODE[200]
      const openapiSpec = await getOpenAPISpec()
      ctx.body = parseYAML(openapiSpec)
    },
  },
  {
    name: 'APIDocs',
    path: '/apidocs',
    method: HttpMethodEnum.GET,
    middleware: [],
    defineHandler: async (ctx: Koa.Context) => {
      ctx.type = 'html'
      const openapiSpec = await getOpenAPISpec()
      ctx.body = apiDocs({
        spec: {
          content: openapiSpec,
        },
      })
    },
  },
  {
    name: 'GraphQL',
    path: '/graphql',
    method: HttpMethodEnum.GET,
    middleware: [],
    defineHandler: async (ctx: Koa.Context) => {
      const response = await yoga.handleNodeRequestAndResponse(ctx.req, ctx.res)
      ctx.status = response.status
      response.headers.forEach((value, key) => {
        ctx.append(key, value)
      })
      ctx.body = response.body
    },
  },
]
/**
 * User routes
 * @type {IRouter[]}
 */
const userRoutes: IRouter[] = [
  {
    name: 'GetUsers',
    path: `${API_PREFIX}/users`,
    method: HttpMethodEnum.GET,
    middleware: [],
    defineHandler: async (ctx: Koa.Context) => {
      try {
        const users = await Query.getUsers()
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
    path: `${API_PREFIX}/user/:id`,
    method: HttpMethodEnum.GET,
    middleware: [userValidator()],
    defineHandler: async (ctx: Koa.Context) => {
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
    path: `${API_PREFIX}/user`,
    method: HttpMethodEnum.POST,
    middleware: [requestValidator(UserSchema)],
    defineHandler: async (ctx: Koa.Context) => {
      try {
        const payload = await Mutation.createUser(null, { input: ctx.request.body })
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
    name: 'PatchUser',
    path: `${API_PREFIX}/user/:id`,
    method: HttpMethodEnum.PATCH,
    middleware: [requestValidator(UserSchema), userValidator()],
    defineHandler: async (ctx: Koa.Context) => {
      try {
        const user = await Mutation.updateUser(null, { id: ctx.params.id, input: ctx.request.body })
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
    path: `${API_PREFIX}/user/:id`,
    method: HttpMethodEnum.DELETE,
    middleware: [userValidator()],
    defineHandler: async (ctx: Koa.Context) => {
      try {
        await Mutation.deleteUser(null, { id: ctx.params.id })
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
/**
 * @type {IRouter[]}
 */
export const routers: IRouter[] = [...mainRoutes, ...userRoutes]

/**
 * @export
 * @param {string} route
 * @returns (IRouter | null)
 */
export function getRouter(route: string): IRouter | null {
  return routers.find(i => i.name.toLowerCase() === route.toLowerCase()) ?? null
}
