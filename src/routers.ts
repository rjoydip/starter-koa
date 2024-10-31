import type { Context } from 'koa'
import type { IUserParams, UserInput } from './schema.ts'
import type { IMetaData, IRouter } from './types.ts'
import { loadavg } from 'node:os'
import { memoryUsage } from 'node:process'
import { parseYAML } from 'confbox/yaml'
import { HttpMethodEnum } from 'koa-body'
import { createError, createSuccess } from './message.ts'
import { resolvers } from './resolvers.ts'
import { apiDocs } from './scalar.ts'
import { insertUserSchema } from './schema.ts'
import {
  API_PREFIX,
  captureException,
  getOpenAPISpec,
  HTTP_STATUS_CODE,
} from './utils.ts'
import { requestValidator, userValidator } from './validator.ts'
import { wsTemplate } from './ws.ts'

/**
 * Defines the main application routes.
 *
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
      const payload = await resolvers.Query.health()
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
      const payload = {
        data: {
          memoryUsage: memoryUsage(),
          loadAverage: loadavg(),
        },
      }
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
      const { license, name, version }: IMetaData = await import('../package.json')
      const payload = {
        data: {
          name,
          license,
          version,
        },
      }
      ctx.status = HTTP_STATUS_CODE[200]
      ctx.body = createSuccess(payload)
    },
  },
  {
    name: 'OpenAPI',
    path: '/openapi.json',
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
    name: 'WSPlayground',
    path: '/_ws',
    method: HttpMethodEnum.GET,
    middleware: [],
    defineHandler: (ctx: Context) => {
      ctx.status = HTTP_STATUS_CODE[200]
      ctx.type = 'html'
      ctx.body = wsTemplate()
    },
  },
]

/**
 * Defines the user-related routes.
 *
 * @type {IRouter[]}
 */
const userRoutes: IRouter[] = [
  {
    name: 'GetUsers',
    path: `/${API_PREFIX}/users`,
    method: HttpMethodEnum.GET,
    middleware: [],
    defineHandler: async (ctx: Context) => {
      try {
        const { page, pageSize }: IUserParams = ctx.request.query
        const data = await resolvers.Query.getUsers({ page, pageSize })
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
    path: `/${API_PREFIX}/user/:id`,
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
    path: `/${API_PREFIX}/user`,
    method: HttpMethodEnum.POST,
    middleware: [requestValidator<UserInput>(insertUserSchema)],
    defineHandler: async (ctx: Context) => {
      try {
        const data = await resolvers.Mutation.createUser(null, { input: ctx.request.body })
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
          data: error,
        })
        captureException(error)
      }
    },
  },
  {
    name: 'PutUser',
    path: `/${API_PREFIX}/user/:id`,
    method: HttpMethodEnum.PUT,
    middleware: [requestValidator<UserInput>(insertUserSchema), userValidator()],
    defineHandler: async (ctx: Context) => {
      try {
        const data = await resolvers.Mutation.updateUser(null, { id: ctx.params.id, input: ctx.request.body })
        ctx.status = HTTP_STATUS_CODE[200]
        ctx.body = createSuccess({
          message: 'User details updated successfully',
          status: HTTP_STATUS_CODE[200],
          data,
        })
      }
      catch (error) {
        ctx.status = HTTP_STATUS_CODE[500]
        ctx.body = createError({
          message: 'User details update failed',
          status: HTTP_STATUS_CODE[500],
        })
        captureException(error)
      }
    },
  },
  {
    name: 'PatchUser',
    path: `/${API_PREFIX}/user/:id`,
    method: HttpMethodEnum.PATCH,
    middleware: [userValidator()],
    defineHandler: async (ctx: Context) => {
      try {
        const data = await resolvers.Mutation.updateUser(null, { id: ctx.params.id, input: ctx.request.body })
        ctx.status = HTTP_STATUS_CODE[200]
        ctx.body = createSuccess({
          message: 'User details updated successfully',
          status: HTTP_STATUS_CODE[200],
          data,
        })
      }
      catch (error) {
        ctx.status = HTTP_STATUS_CODE[500]
        ctx.body = createError({
          message: 'User details update failed',
          status: HTTP_STATUS_CODE[500],
        })
        captureException(error)
      }
    },
  },
  {
    name: 'DeleteUser',
    path: `/${API_PREFIX}/user/:id`,
    method: HttpMethodEnum.DELETE,
    middleware: [userValidator()],
    defineHandler: async (ctx: Context) => {
      try {
        await resolvers.Mutation.deleteUser(null, { id: ctx.params.id })
        ctx.status = HTTP_STATUS_CODE[200]
        ctx.body = createSuccess({
          message: 'User deleted successfully',
          data: ctx.state.user,
        })
      }
      catch (error) {
        ctx.status = HTTP_STATUS_CODE[500]
        ctx.body = createError({
          message: 'User data deletion failed',
          status: HTTP_STATUS_CODE[500],
        })
        captureException(error)
      }
    },
  },
]

/**
 * Combines all main and user routes into a single array for the application router.
 *
 * @type {IRouter[]}
 */
export const routers: IRouter[] = [...mainRoutes, ...userRoutes]

/**
 * Retrieves a route configuration by its name.
 *
 * @export
 * @param {string} route - The name of the route to retrieve.
 * @returns {IRouter | null} - The matching route configuration or null if not found.
 */
export function getRouter(route: string): IRouter | null {
  return routers.find(i => i.name.toLowerCase() === route.toLowerCase()) ?? null
}
