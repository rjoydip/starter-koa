import type { LogLevel } from 'consola'
import type { Context, Middleware, Next } from 'koa'
import type { HttpMethod } from 'koa-body'
import type { EnvObject, RuntimeName } from 'std-env'
import type { InferOutput } from 'valibot'
import type { UserSchema } from './schema'

export type Services = 'db' | 'redis'
export type User = InferOutput<typeof UserSchema>
export interface IRegisteredRoutes {
  method: HttpMethod[]
  path: string
  regexp: RegExp
}
export interface IHealth {
  id: string
  services: Services
  up: boolean
}
export interface IConfig {
  server?: {
    host?: string
    port?: number
  }
  app?: {
    env?: EnvObject
    log_level: LogLevel
    services?: Services[]
    ratelimit?: number
  }
  system?: {
    platform?: NodeJS.Platform
    runtime?: RuntimeName
  }
}
export interface IRouter {
  name: string
  path: string
  method: HttpMethod
  middleware: Middleware[]
  handler: (ctx: Context, next: Next) => Promise<void>
}
