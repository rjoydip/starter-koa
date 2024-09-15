import type { Context, Next } from 'koa'
import type { EnvObject, RuntimeName } from 'std-env'
import type { IConfig, IHealth, IRegisteredRoutes, IRouter, Services, User } from '../src/types'
import { describe, expectTypeOf, it } from 'vitest'

describe('❯ Validate types', () => {
  it('● should validated types', async () => {
    expectTypeOf<Services>().toMatchTypeOf<'db' | 'redis'>()
    expectTypeOf<User>().toMatchTypeOf<{ _id: string, name: string, email: string, phone: string, address: string }>()
  })

  it('● should validated interfaces', () => {
    expectTypeOf({ method: ['GET'], path: '/', regexp: /^(\?:\/)(?:\/\$)?$/ }).toMatchTypeOf<IRegisteredRoutes>()

    expectTypeOf({
      id: 'x',
      services: 'db' as Services,
      up: true,
    }).toMatchTypeOf<IHealth>()

    expectTypeOf({
      server: {
        host: 'host',
        port: 1111,
      },
      app: {
        env: {
          foo: '',
        } as EnvObject,
        log_level: 3,
        services: ['db'] as Services[],
        ratelimit: 100,
      },
      system: {
        platform: 'linux' as NodeJS.Platform,
        runtime: '' as RuntimeName,
      },
    }).toMatchTypeOf<IConfig>()

    expectTypeOf({
      name: 'x',
      path: '/',
      method: 'GET',
      middleware: [],
      handler: (_ctx: Context, _next: Next) => Promise.resolve(),
    }).toMatchTypeOf<IRouter>()
  })
})
