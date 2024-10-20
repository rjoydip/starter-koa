import type { Context, Middleware, Next } from 'koa'
import type { HttpMethodEnum } from 'koa-body/lib/types'

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
   * @type {boolean}
   */
  db: boolean
  /**
   * @type {boolean}
   */
  redis: boolean
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
   * @type {(ctx: Context, next: Next) => Promise<void> | void}
   */
  defineHandler: (ctx: Context, next: Next) => Promise<void> | void
}

/**
 * @export
 * @typedef {Runtime}
 */
export type Runtime = 'node' | 'bun' | 'deno'

/**
 * @export
 * @interface IMetaData
 * @typedef {IMetaData}
 */
export interface IMetaData {
  /**
   * @type {string}
   */
  description: string
  /**
   * @type {string}
   */
  license: string
  /**
   * @type {string}
   */
  name: string
  /**
   * @type {string}
   */
  version: string
}

/**
 * @export
 * @interface IMetrics
 * @typedef {IMetrics}
 */
export interface IMetrics {
  /**
   * @type {NodeJS.MemoryUsage}
   */
  memoryUsage: NodeJS.MemoryUsage
  /**
   * @type {number[]}
   */
  loadAverage: number[]
}

/**
 * @export
 * @typedef {THooksMapper}
 */
export type THooksMapper = 'health' | '_metrics' | '_meta' | 'getUsers' | 'getUser' | 'createUser' | 'updateUser' | 'deleteUser'
