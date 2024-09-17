import type Router from 'koa-router'
import type { IRegisteredRoutes } from './types'
import process from 'node:process'
import * as Sentry from '@sentry/node'
import invariant from 'tiny-invariant'
import logger from './logger'

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
  if (isProduction()) {
    invariant(false, () => {
      Sentry.captureException(errMsg)
      logger.error(errMsg)
      return errMsg
    })
  }
  else {
    invariant(isDevelopment() || isTest(), errMsg)
  }
}

export function isDevelopment(): boolean {
  return environment() === 'development'
}

export function isTest(): boolean {
  return environment() === 'test'
}

export function isProduction(): boolean {
  return environment() === 'production'
}

export function environment(): string {
  return process.env.NODE_ENV || 'development'
}
