import type { Context, Next } from 'koa'
import type { IConfig } from '../src/config.ts'
import type { IMessage } from '../src/message.ts'
import type {
  IHealth,
  IRegisteredRoutes,
  IRouter,
  Runtime,
  THooksMapper,
} from '../src/types.ts'
import { HttpMethodEnum } from 'koa-body/lib/types'
import { describe, expectTypeOf, it } from 'vitest'

describe('⬢ Validate types', () => {
  it('● should validated types', () => {
    expectTypeOf<Runtime>().toMatchTypeOf<'node' | 'deno' | 'bun'>()
    expectTypeOf<THooksMapper>().toMatchTypeOf<'health' | '_metrics' | '_meta' | 'getUsers' | 'getUser' | 'createUser' | 'updateUser' | 'deleteUser'>()
  })

  it('● should validated interfaces', () => {
    expectTypeOf({
      method: [HttpMethodEnum.GET],
      path: '/',
      regexp: /^(\?:\/)(?:\/\$)?$/,
    }).toMatchTypeOf<IRegisteredRoutes>()

    expectTypeOf({
      db: true,
      redis: true,
    }).toMatchTypeOf<IHealth>()

    expectTypeOf({
      ip: '127.0.0.1',
      port: 0,
      graphql_port: 0,
      isHTTPs: false,
      log_level: 3,
      ratelimit: 0,
      duration: 0,
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
      defineHandler: (_ctx: Context, _next: Next) => Promise.resolve(),
    }).toMatchTypeOf<IRouter>()
  })
})
