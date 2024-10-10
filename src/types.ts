import type { Context, Middleware, Next } from 'koa'
import type { HttpMethodEnum } from 'koa-body/lib/types'
import type { UserSchema } from './schema'

/**
 * @export
 * @typedef {User}
 */
export type User = typeof UserSchema
export interface UserInput extends Omit<typeof UserSchema, 'id'> {}
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
   * @type {HttpMethodEnum}
   */
  method: HttpMethodEnum
  /**
   * @type {Middleware[]}
   */
  middleware: Middleware[]
  /**
   * @type {(ctx: Context, next: Next) => Promise<void>}
   */
  defineHandler: (ctx: Context, next: Next) => Promise<void>
}

/**
 * @export
 * @typedef {Runtime}
 */
export type Runtime = 'node' | 'bun' | 'deno'
