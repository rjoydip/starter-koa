import type { Context, Middleware, Next } from 'koa'
import type { HttpMethod } from 'koa-body'
import type { InferOutput } from 'valibot'
import type { UserSchema } from './schema'

/**
 * ${1:Description placeholder}
 *
 * @export
 * @typedef {Services}
 */
export type Services = 'db' | 'redis'
/**
 * ${1:Description placeholder}
 *
 * @export
 * @typedef {User}
 */
export type User = InferOutput<typeof UserSchema>
/**
 * ${1:Description placeholder}
 *
 * @export
 * @interface IRegisteredRoutes
 * @typedef {IRegisteredRoutes}
 */
export interface IRegisteredRoutes {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  path: string
  /**
   * ${1:Description placeholder}
   *
   * @type {RegExp}
   */
  regexp: RegExp
}
/**
 * ${1:Description placeholder}
 *
 * @export
 * @interface IHealth
 * @typedef {IHealth}
 */
export interface IHealth {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  id: string
  /**
   * ${1:Description placeholder}
   *
   * @type {Services}
   */
  services: Services
  /**
   * ${1:Description placeholder}
   *
   * @type {boolean}
   */
  up: boolean
}
/**
 * ${1:Description placeholder}
 *
 * @export
 * @interface IRouter
 * @typedef {IRouter}
 */
export interface IRouter {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  name: string
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  path: string
  /**
   * ${1:Description placeholder}
   *
   * @type {HttpMethod}
   */
  method: HttpMethod
  /**
   * ${1:Description placeholder}
   *
   * @type {Middleware[]}
   */
  middleware: Middleware[]
  /**
   * ${1:Description placeholder}
   *
   * @type {(ctx: Context, next: Next) => Promise<void>}
   */
  handler: (ctx: Context, next: Next) => Promise<void>
}

/**
 * ${1:Description placeholder}
 *
 * @export
 * @typedef {Runtime}
 */
export type Runtime = 'node' | 'bun' | 'deno'
