import type { Runtime } from './types'
import process from 'node:process'
import { captureException as sentryCaptureException } from '@sentry/node'
import logger from './logger'

/**
 * @type {string}
 */
const prefix: string = 'Invariant failed'

/**
 * @export
 * @param {boolean} condition
 * @param {?(string | (() => string))} [message]
 */
export function invariant(condition: boolean, message?: string | (() => string)): Error | undefined {
  if (condition) {
    return
  }
  const provided: string | undefined = typeof message === 'function' ? message() : message
  const value: string = provided ? `${prefix}: ${provided}` : prefix
  throw new Error(value)
}

/**
 * @export
 * @param {(Error | string)} errorMessage
 */
export function captureException(errorMessage: Error | string): void {
  const errMsg = errorMessage instanceof Error ? errorMessage.message : errorMessage
  const showError = !isProd() // false = show error
  invariant(showError, () => {
    logger.error(errMsg)
    sentryCaptureException(errMsg)
    return errMsg
  })
}

/**
 * Determines the platform for test execution.
 */
export function getRuntime(): Runtime {
  if (typeof globalThis.Deno !== 'undefined')
    return 'deno'
  if (typeof globalThis.Bun !== 'undefined')
    return 'bun'

  return 'node'
}

/**
 * @export
 * @returns boolean
 */
export function isDev(): boolean {
  return environment() === 'development' || environment() === 'dev'
}

/**
 * @export
 * @returns boolean
 */
export function isTest(): boolean {
  return environment() === 'test' || environment() === 'testing'
}

/**
 * @export
 * @returns boolean
 */
export function isProd(): boolean {
  return environment() === 'production' || environment() === 'prod'
}

/**
 * @export
 * @returns string
 */
export function environment(): string {
  return process.env.NODE_ENV || 'development'
}

/**
 * @type {{ 200: number; 401: number; 500: number; 422: number; }\}
 */
export const HTTP_STATUS_CODE = {
  200: 200,
  401: 401,
  500: 500,
  422: 422,
}
