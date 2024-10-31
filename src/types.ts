import type { Context, Middleware, Next } from 'koa'
import type { HttpMethodEnum } from 'koa-body/lib/types'

/**
 * Represents the application structure.
 * @interface TApplication
 */
export interface TApplication {}

/**
 * Represents a registered route.
 * @interface IRegisteredRoutes
 * @property {string} path - The path of the route.
 * @property {RegExp} regexp - The regular expression to match the route.
 */
export interface IRegisteredRoutes {
  path: string
  regexp: RegExp
}

/**
 * Represents the health status of various components.
 * @interface IHealth
 * @property {boolean} db - Indicates if the database is healthy.
 * @property {boolean} cache - Indicates if the cache is healthy.
 */
export interface IHealth {
  db: boolean
  cache: boolean
}

/**
 * Represents a route in the application.
 * @interface IRouter
 * @property {string} name - The name of the route.
 * @property {string} path - The path of the route.
 * @property {HttpMethodEnum} method - The HTTP method used for the route.
 * @property {Middleware[]} middleware - An array of middleware functions for the route.
 * @property {(ctx: Context, next: Next) => Promise<void> | void} defineHandler - The function to handle the route.
 */
export interface IRouter {
  name: string
  path: string
  method: HttpMethodEnum
  middleware: Middleware[]
  defineHandler: (ctx: Context, next: Next) => Promise<void> | void
}

/**
 * Defines the runtime environment.
 * @typedef {'node' | 'bun' | 'deno'} Runtime
 */
export type Runtime = 'node' | 'bun' | 'deno'

/**
 * Represents metadata information.
 * @interface IMetaData
 * @property {string} license - The license of the application.
 * @property {string} name - The name of the application.
 * @property {string} version - The version of the application.
 */
export interface IMetaData {
  license: string
  name: string
  version: string
}

/**
 * Represents performance metrics.
 * @interface IMetrics
 * @property {NodeJS.MemoryUsage} memoryUsage - Memory usage information.
 * @property {number[]} loadAverage - An array of load averages.
 */
export interface IMetrics {
  memoryUsage: NodeJS.MemoryUsage
  loadAverage: number[]
}

/**
 * Maps various hooks to their respective identifiers.
 * @typedef {'health' | '_metrics' | '_meta' | 'getUsers' | 'getUser' | 'createUser' | 'updateUser' | 'deleteUser'} THooksMapper
 */
export type THooksMapper = 'health' | '_metrics' | '_meta' | 'getUsers' | 'getUser' | 'createUser' | 'updateUser' | 'deleteUser'
