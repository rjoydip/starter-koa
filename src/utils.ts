import type { Runtime } from './types.ts'
import { readFile } from 'node:fs/promises'
import { env } from 'node:process'
import { captureException as sentryCaptureException } from '@sentry/node'
import logger from './logger.ts'

// Error prefix used in invariant checks
const prefix: string = 'Invariant failed'

// API prefix constant
export const API_PREFIX = 'api' as const

/**
 * Throws an error if the given condition is false.
 *
 * @export
 * @param {boolean} condition - The condition to check.
 * @param {string | (() => string)} [message] - Optional message or function returning a message to throw.
 * @returns {Error | undefined} - Throws an Error if the condition is false, otherwise undefined.
 */
export function invariant(
  condition: boolean,
  message?: string | (() => string),
): Error | undefined {
  if (condition) {
    return
  }

  const provided: string | undefined = typeof message === 'function'
    ? message()
    : message

  const value: string = provided ? `${prefix}: ${provided}` : prefix
  throw new Error(value)
}

/**
 * Captures an exception and logs it using Sentry and the logger.
 *
 * @export
 * @param {Error | string | unknown} errorMessage - The error message or object to log.
 * @returns {void}
 */
export function captureException(errorMessage: Error | string | unknown): void {
  const errMsg: string = errorMessage instanceof Error
    ? errorMessage.message
    : String(errorMessage)

  invariant(!isProd(), () => {
    logger.error(errMsg)
    sentryCaptureException(errMsg)
    return errMsg
  })
}

/**
 * Determines the platform for test execution.
 *
 * @returns {Runtime} - The runtime environment: 'deno', 'bun', or 'node'.
 */
export function getRuntime(): Runtime {
  if (typeof globalThis.Deno !== 'undefined') {
    return 'deno'
  }
  if (typeof globalThis.Bun !== 'undefined') {
    return 'bun'
  }

  return 'node'
}

/**
 * Checks if the environment is development.
 *
 * @export
 * @returns {boolean} - True if in development mode, false otherwise.
 */
export function isDev(): boolean {
  return env.NODE_ENV === 'development' || env.NODE_ENV === 'dev'
}

/**
 * Checks if the environment is for testing.
 *
 * @export
 * @returns {boolean} - True if in test mode, false otherwise.
 */
export function isTest(): boolean {
  return env.NODE_ENV === 'test' || env.NODE_ENV === 'testing'
}

/**
 * Checks if the environment is production.
 *
 * @export
 * @returns {boolean} - True if in production mode, false otherwise.
 */
export function isProd(): boolean {
  return env.NODE_ENV === 'production' || env.NODE_ENV === 'prod'
}

/**
 * Gets the current environment.
 *
 * @export
 * @returns {string} - The current environment name, defaults to 'development'.
 */
export function environment(): string {
  return env.NODE_ENV || 'development'
}

/**
 * HTTP status codes.
 *
 * @type {{ 200: number; 401: number; 500: number; 422: number; }}
 */
export const HTTP_STATUS_CODE = {
  200: 200,
  401: 401,
  500: 500,
  422: 422,
}

/**
 * Retrieves the OpenAPI specification from a YAML file.
 *
 * @export
 * @async
 * @returns {Promise<string>} - The content of the OpenAPI spec file.
 */
export async function getOpenAPISpec(): Promise<string> {
  return await readFile('./src/openapi.yaml', { encoding: 'utf8' })
}
