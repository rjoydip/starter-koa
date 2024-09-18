import type Router from 'koa-router'
import type { BuildResponse, IRegisteredRoutes } from './types'
import process from 'node:process'
import * as Sentry from '@sentry/node'
import invariant from 'tiny-invariant'
import { MESSAGE } from './constants'
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

function buildResponse({
  status,
  status_code,
  message,
  data = {},
  error,
  meta = null,
}: BuildResponse): BuildResponse {
  const response: BuildResponse = {
    status: status || 'success',
    status_code: status_code || 200,
    message: message || 'Request successful',
    data,
  }

  if (error) {
    response.status = 'failure'
    response.message = message || 'Request failed'
    response.status_code = status_code ?? 500
    response.data = {}
    response.error = {
      code: error.code || MESSAGE.INTERNAL_ERROR,
      type: error.type || MESSAGE.RESPONSE_ERROR,
      message: error.message || 'An error occurred',
    }
  }
  else {
    response.error = {}
  }

  if (meta) {
    response.meta = meta
  }

  return response
}

export function successResponse({
  data,
  status_code,
  message,
  meta,
}: BuildResponse): BuildResponse {
  return buildResponse({ message, status_code, data, meta })
}

export function errorResponse({
  error,
  status_code,
  message,
  meta,
}: BuildResponse): BuildResponse {
  return buildResponse({ message, status_code, error, meta })
}
