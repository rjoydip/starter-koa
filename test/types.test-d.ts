import type { Context, Next } from 'koa'
import type { EnvObject, RuntimeName } from 'std-env'
import type { IConfig } from '../src/config'
import type { IMessage } from '../src/message'
import type { IHealth, IRegisteredRoutes, IRouter, Services, User } from '../src/types'
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
        host: '127.0.0.1',
        port: 0,
        isHTTPs: false,
      },
      app: {
        env: {
          foo: '',
        } as EnvObject,
        log_level: 3,
        services: ['db'] as Services[],
        ratelimit: 0,
        duration: 0,
      },
      system: {
        platform: 'linux' as NodeJS.Platform,
        runtime: '' as RuntimeName,
      },
    }).toMatchTypeOf<IConfig>()

    expectTypeOf<IMessage>({
      statusCode: 200,
      message: 'Request success',
      data: {},
    }).toMatchTypeOf()
    expectTypeOf<IMessage>({
      status: 200,
      statusMessage: 'Request success',
      data: {},
      message: 'Success message',
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
