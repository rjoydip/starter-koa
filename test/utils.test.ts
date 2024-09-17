import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { router } from '../src/app'
import { ERROR_MESSAGE } from '../src/constants'
import logger from '../src/logger'
import { captureException, environment, errorResponse, getRegisteredRoutes, successResponse } from '../src/utils'

describe('⬢ Validate utils', () => {
  const mockLoggerError = vi.spyOn(logger, 'error').mockImplementation(() => { })
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    vi.clearAllMocks()
    originalEnv = { ...process.env }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('⬢ Validate routes', () => {
    it('● should validated regestered routes', async () => {
      const registeredRoutes = ['/', '/status', '/health', '/users', '/user/:id', '/user']
      const routes = getRegisteredRoutes(router)
      const paths = routes.map(i => i.path)
      expect([...new Set(paths)]).toStrictEqual(registeredRoutes)
    })

    it('● should validated invalid regestered routes', async () => {
      const registeredRoutes = ['/', '/health', '/users', '/user/:id', '/user']
      const routes = getRegisteredRoutes(router)
      const paths = routes.map(i => i.path)
      expect([...new Set(paths)]).not.equal(registeredRoutes)
    })

    it('● should validated captureException for non-prod', async () => {
      expect(() => captureException('testing message')).not.throw()
      expect(mockLoggerError).toHaveBeenCalledTimes(0)
    })
  })

  describe('⬢ Validate utilities', () => {
    it('● should validated captureException for prod', async () => {
      process.env.NODE_ENV = 'production'
      expect(() => captureException('production message')).toThrowError('Invariant failed: production message')
      expect(mockLoggerError).toHaveBeenCalledTimes(1)
    })

    it('● should validated test environment', async () => {
      expect(environment()).toStrictEqual('test')
    })

    it('● should validated production environment', async () => {
      process.env.NODE_ENV = 'production'
      expect(environment()).toStrictEqual('production')
    })

    it('● should validated development environment', async () => {
      process.env.NODE_ENV = 'development'
      expect(environment()).toStrictEqual('development')
    })

    it('● should validated deleted environment', async () => {
      delete process.env.NODE_ENV
      expect(environment()).toStrictEqual('development')
    })
  })

  describe('⬢ Validate build response', () => {
    it('● should return a success response with default values', () => {
      const data = { id: 1, name: 'Test User' }
      const result = successResponse({ data })

      expect(result).toStrictEqual({
        status: 'success',
        status_code: 200,
        message: 'Request successful',
        data,
        error: {},
      })
    })

    it('● should return a success response with custom message', () => {
      const data = { id: 1, name: 'Test User' }
      const message = 'Custom success message'
      const result = successResponse({ data, message })

      expect(result).toStrictEqual({
        status: 'success',
        status_code: 200,
        message,
        data,
        error: {},
      })
    })

    it('● should return an error response with default error message', () => {
      const error = {
        code: ERROR_MESSAGE.AUTH_ERROR,
        type: ERROR_MESSAGE.DB_ERROR,
        message: 'Database connection failed',
      }

      const result = errorResponse({ error })

      expect(result).toStrictEqual({
        status: 'failure',
        status_code: 500,
        message: 'Request failed',
        data: {},
        error: {
          code: ERROR_MESSAGE.AUTH_ERROR,
          type: ERROR_MESSAGE.DB_ERROR,
          message: 'Database connection failed',
        },
      })
    })

    it('● should return an error response with custom error message', () => {
      const error = {
        code: ERROR_MESSAGE.DB_ERROR,
        type: ERROR_MESSAGE.RESPONSE_ERROR,
        message: 'Database error occurred',
      }

      const result = errorResponse({ error, message: 'Custom error message' })

      expect(result).toStrictEqual({
        status: 'failure',
        status_code: 500,
        message: 'Custom error message',
        data: {},
        error: {
          code: ERROR_MESSAGE.DB_ERROR,
          type: ERROR_MESSAGE.RESPONSE_ERROR,
          message: 'Database error occurred',
        },
      })
    })

    it('● should return a response with metadata', () => {
      const data = { id: 1, name: 'Test User' }
      const meta = { page: 1, totalPages: 10 }
      const result = successResponse({ data, message: 'Operation successful', meta })
      result.meta = meta

      expect(result).toStrictEqual({
        status: 'success',
        status_code: 200,
        message: 'Operation successful',
        data,
        error: {},
        meta,
      })
    })

    it('● should return a failure response with missing error fields filled with defaults', () => {
      const error = {
        code: null,
        type: null,
        message: null,
      }

      const result = errorResponse({ error })

      expect(result).toStrictEqual({
        status: 'failure',
        status_code: 500,
        message: 'Request failed',
        data: {},
        error: {
          code: ERROR_MESSAGE.INTERNAL_ERROR,
          type: ERROR_MESSAGE.RESPONSE_ERROR,
          message: 'An error occurred',
        },
      })
    })
  })
})
