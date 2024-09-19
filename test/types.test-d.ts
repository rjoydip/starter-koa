import type { Context, Next } from 'koa'
import type { EnvObject, RuntimeName } from 'std-env'
import type { BuildResponse, IConfig, IHealth, IRegisteredRoutes, IRouter, Services, User } from '../src/types'
import { HttpMethodEnum } from 'koa-body'
import { describe, expectTypeOf, it } from 'vitest'

describe('⬢ Validate types', () => {
  it('● should validated types', async () => {
    expectTypeOf<Services>().toMatchTypeOf<'db' | 'redis'>()
    expectTypeOf<User>().toMatchTypeOf<{ name: string, email: string, phone: string, address: string }>()
  })

  it('● should validated interfaces', () => {
    expectTypeOf({ method: [HttpMethodEnum.GET], path: '/', regexp: /^(\?:\/)(?:\/\$)?$/ }).toMatchTypeOf<IRegisteredRoutes>()

    expectTypeOf({
      id: 'x',
      services: 'db' as Services,
      up: true,
    }).toMatchTypeOf<IHealth>()

    expectTypeOf({
      server: {
        host: 'host',
        port: 0,
      },
      app: {
        env: {
          foo: '',
        } as EnvObject,
        log_level: 3,
        services: ['db'] as Services[],
        ratelimit: 0,
      },
      system: {
        platform: 'linux' as NodeJS.Platform,
        runtime: '' as RuntimeName,
      },
    }).toMatchTypeOf<IConfig>()

    expectTypeOf<BuildResponse>({
      status: 'success',
      status_code: 200,
      message: 'Request failed',
      data: {},
      error: {
        code: 'INTERNAL_ERROR',
        type: 'RESPONSE_ERROR',
        message: 'An error occurred',
      },
      meta: {},
    }).toMatchTypeOf()

    expectTypeOf({
      name: 'x',
      path: '/',
      method: HttpMethodEnum.GET,
      middleware: [],
      handler: (_ctx: Context, _next: Next) => Promise.resolve(),
    }).toMatchTypeOf<IRouter>()
  })
})
