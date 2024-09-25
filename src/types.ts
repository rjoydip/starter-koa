import type { Context, Middleware, Next } from 'koa'
import type { HttpMethod } from 'koa-body'
import type { InferOutput } from 'valibot'
import type { UserSchema } from './schema'

export type Services = 'db' | 'redis'
export type User = InferOutput<typeof UserSchema>
export interface IRegisteredRoutes {
  path: string
  regexp: RegExp
}
export interface IHealth {
  id: string
  services: Services
  up: boolean
}
export interface IRouter {
  name: string
  path: string
  method: HttpMethod
  middleware: Middleware[]
  handler: (ctx: Context, next: Next) => Promise<void>
}

export type Runtime = 'node' | 'bun' | 'deno'
