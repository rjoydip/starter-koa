import type { Context, Middleware, Next } from 'koa'
import type { HttpMethod } from 'koa-body'
import type { InferOutput } from 'valibot'
import type { UserSchema } from './schema'

/**
 * @export
 * @typedef {Services}
 */
export type Services = 'db' | 'redis'
/**
 * @export
 * @typedef {User}
 */
export type User = InferOutput<typeof UserSchema>
/**
 * @export
 * @interface IRegisteredRoutes
 * @typedef {IRegisteredRoutes}
 */
export interface IRegisteredRoutes {
  /**
   * @type {string}
   */
  path: string
  /**
   * @type {RegExp}
   */
  regexp: RegExp
}
/**
 * @export
 * @interface IHealth
 * @typedef {IHealth}
 */
export interface IHealth {
  /**
   * @type {string}
   */
  id: string
  /**
   * @type {Services}
   */
  services: Services
  /**
   * @type {boolean}
   */
  up: boolean
}
/**
 * @export
 * @interface IRouter
 * @typedef {IRouter}
 */
export interface IRouter {
  /**
   * @type {string}
   */
  name: string
  /**
   * @type {string}
   */
  path: string
  /**
   * @type {HttpMethod}
   */
  method: HttpMethod
  /**
   * @type {Middleware[]}
   */
  middleware: Middleware[]
  /**
   * @type {(ctx: Context, next: Next) => Promise<void>}
   */
  handler: (ctx: Context, next: Next) => Promise<void>
}

/**
 * @export
 * @typedef {Runtime}
 */
export type Runtime = 'node' | 'bun' | 'deno'
