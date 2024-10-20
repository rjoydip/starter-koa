import type { Context } from 'koa'
import type { UserInput } from './schema.ts'
import type { IRouter } from './types.ts'
import { parseYAML } from 'confbox/yaml'
import { createYoga } from 'graphql-yoga'
import { HttpMethodEnum } from 'koa-body'
import { graphqlSchema } from './db.ts'
import { createError, createSuccess } from './message.ts'
import resolvers from './resolvers.ts'
import { apiDocs } from './scalar.ts'
import { insertUserSchema } from './schema.ts'
import {
  API_PREFIX,
  captureException,
  getOpenAPISpec,
  HTTP_STATUS_CODE,
} from './utils.ts'
import { requestValidator, userValidator } from './validator.ts'
import { wsTemplete } from './ws.ts'

const yoga = createYoga({
  landingPage: true,
  schema: graphqlSchema,
})

const { Mutation, Query } = resolvers

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
    defineHandler: (ctx: Context) => {
      ctx.status = HTTP_STATUS_CODE[200]
      ctx.body = createSuccess({
        message: 'Welcome to Koa Starter',
      })
    },
  },
  {
    name: 'Status',
    path: '/status',
    method: HttpMethodEnum.GET,
    middleware: [],
    defineHandler: (ctx: Context) => {
      ctx.status = HTTP_STATUS_CODE[200]
      ctx.body = createSuccess({
        data: { status: 'up' },
      })
    },
  },
  {
    name: 'Health',
    path: '/health',
    method: HttpMethodEnum.GET,
    middleware: [],
    defineHandler: async (ctx: Context) => {
      const payload = await Query.health()
      ctx.status = HTTP_STATUS_CODE[200]
      ctx.body = createSuccess(payload)
    },
  },
  {
    name: 'Metrics',
    path: '/_metrics',
    method: HttpMethodEnum.GET,
    middleware: [],
    defineHandler: async (ctx: Context) => {
      const payload = await Query._metrics()
      ctx.status = HTTP_STATUS_CODE[200]
      ctx.body = createSuccess(payload)
    },
  },
  {
    name: 'Meta',
    path: '/_meta',
    method: HttpMethodEnum.GET,
    middleware: [],
    defineHandler: async (ctx: Context) => {
      const payload = await Query._meta()
      ctx.status = HTTP_STATUS_CODE[200]
      ctx.body = createSuccess(payload)
    },
  },
  {
    name: 'OpenAPI',
    path: '/openapi',
    method: HttpMethodEnum.GET,
    middleware: [],
    defineHandler: async (ctx: Context) => {
      ctx.status = HTTP_STATUS_CODE[200]
      const openapiSpec = await getOpenAPISpec()
      ctx.body = parseYAML(openapiSpec)
    },
  },
  {
    name: 'APIDocs',
    path: '/references',
    method: HttpMethodEnum.GET,
    middleware: [],
    defineHandler: async (ctx: Context) => {
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
    defineHandler: async (ctx: Context) => {
      const response = await yoga.handleNodeRequestAndResponse(
        ctx.req,
        ctx.res,
      )
      ctx.status = response.status
      response.headers.forEach((value, key) => {
        ctx.append(key, value)
      })
      ctx.body = response.body
    },
  },
  {
    name: 'WSTest',
    path: '/_ws',
    method: HttpMethodEnum.GET,
    middleware: [],
    defineHandler: (ctx: Context) => {
      ctx.status = HTTP_STATUS_CODE[200]
      ctx.type = 'html'
      ctx.body = wsTemplete()
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
    defineHandler: async (ctx: Context) => {
      try {
        const data = await Query.getUsers()
        ctx.status = HTTP_STATUS_CODE[200]
        ctx.body = createSuccess({
          status: HTTP_STATUS_CODE[200],
          message: 'Fetched all user details successfully',
          data,
        })
      }
      catch (error) {
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
    defineHandler: (ctx: Context) => {
      const data = ctx.state.user
      ctx.status = HTTP_STATUS_CODE[200]
      ctx.body = createSuccess({
        message: 'Fetched user details successfully',
        status: HTTP_STATUS_CODE[200],
        data,
      })
      ctx.state = undefined
    },
  },
  {
    name: 'PostUser',
    path: `${API_PREFIX}/user`,
    method: HttpMethodEnum.POST,
    middleware: [requestValidator<UserInput>(insertUserSchema)],
    defineHandler: async (ctx: Context) => {
      try {
        const data = await Mutation.createUser(null, { input: ctx.request.body })
        ctx.status = HTTP_STATUS_CODE[200]
        ctx.body = createSuccess({
          message: 'User details stored successfully',
          data,
        })
      }
      catch (error) {
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
    path: `${API_PREFIX}/user/:id`,
    method: HttpMethodEnum.PUT,
    middleware: [requestValidator<UserInput>(insertUserSchema), userValidator()],
    defineHandler: async (ctx: Context) => {
      try {
        const data = await Mutation.updateUser(null, { id: ctx.params.id, input: ctx.request.body })
        ctx.status = HTTP_STATUS_CODE[200]
        ctx.body = createSuccess({
          message: 'User details updates successfully',
          status: HTTP_STATUS_CODE[200],
          data,
        })
      }
      catch (error) {
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
    defineHandler: async (ctx: Context) => {
      try {
        await Mutation.deleteUser(null, { id: ctx.params.id })
        ctx.status = HTTP_STATUS_CODE[200]
        ctx.body = createSuccess({
          message: 'User delete successfully',
          data: ctx.state.user,
        })
      }
      catch (error) {
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
  return routers.find(i => i.name.toLowerCase() === route.toLowerCase())
    ?? null
}
