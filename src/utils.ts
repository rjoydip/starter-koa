import type Router from 'koa-router'
import type { IRegisteredRoutes } from './types'
import process from 'node:process'
import { captureException as sentryCaptureException } from '@sentry/node'
import logger from './logger'

const prefix: string = 'Invariant failed'

export function invariant(condition: boolean, message?: string | (() => string)): Error | undefined {
  if (condition) {
    return
  }

  const provided: string | undefined = typeof message === 'function' ? message() : message

  const value: string = provided ? `${prefix}: ${provided}` : prefix
  throw new Error(value)
}

export function getRegisteredRoutes(router: Router<any>): IRegisteredRoutes[] {
  return router.stack.map((layer) => {
    return {
      path: layer.path,
      regexp: layer.regexp,
    }
  })
}

export function captureException(errorMessage: Error | string): void {
  const errMsg = errorMessage instanceof Error ? errorMessage.message : errorMessage
  const showError = !isProd() // false = show error
  invariant(showError, () => {
    logger.error(errMsg)
    try {
      sentryCaptureException(errMsg)
    }
    catch (e: unknown) {
      logger.error(e)
    }
    return errMsg
  })
}

export function isDev(): boolean {
  return environment() === 'development' || environment() === 'dev'
}

export function isTest(): boolean {
  return environment() === 'test' || environment() === 'testing'
}

export function isProd(): boolean {
  return environment() === 'production' || environment() === 'prod'
}

export function environment(): string {
  return process.env.NODE_ENV || 'development'
}

export const HTTP_STATUS_CODE = {
  200: 200,
  401: 401,
  500: 500,
  422: 422,
}
