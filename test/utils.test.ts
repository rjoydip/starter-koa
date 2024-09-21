import { getTraceData, init, isInitialized, captureException as sentryCaptureException } from '@sentry/node'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { router } from '../src/app'
import logger from '../src/logger'
import { captureException, environment, getRegisteredRoutes, HTTP_STATUS_CODE, invariant, isDev, isProd, isTest } from '../src/utils'

describe('⬢ Validate utils', () => {
  const MY_APP_DSN = 'http://acacaeaccacacacabcaacdacdacadaca@sentry.io/000001'
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
      expect(() => captureException('testing message')).not.toThrowError()
      expect(mockLoggerError).toHaveBeenCalledTimes(0)
    })
  })

  describe('⬢ Validate utilities', () => {
    it('● should validated invariant for prod', async () => {
      process.env.NODE_ENV = 'production'
      expect(() => invariant(false, 'production message')).toThrowError('Invariant failed')
      expect(mockLoggerError).toHaveBeenCalledTimes(0)
    })

    it('● should validated invariant for no-prod', async () => {
      process.env.NODE_ENV = 'development'
      expect(() => invariant(true, 'development message')).not.throw()
      expect(mockLoggerError).toHaveBeenCalledTimes(0)
    })

    it('● should validated captureException for prod', async () => {
      process.env.NODE_ENV = 'production'
      expect(() => captureException('production message')).toThrowError('Invariant failed')
      expect(mockLoggerError).toBeCalledWith('production message')
      expect(mockLoggerError).toHaveBeenCalledTimes(1)
    })

    it('● should validated sentry exception ', async () => {
      process.env.NODE_ENV = 'production'
      expect(() => captureException('production message')).toThrowError('Invariant failed')
      expect(mockLoggerError).toBeCalledWith('production message')
      expect(mockLoggerError).toHaveBeenCalledTimes(1)
    })

    it('● should validated captureException for non-prod', async () => {
      process.env.NODE_ENV = 'development'
      expect(() => captureException('development message')).not.throw()
      expect(mockLoggerError).toHaveBeenCalledTimes(0)
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

    it('● should validated isDev', async () => {
      delete process.env.NODE_ENV
      expect(isDev()).toBeTruthy()
      process.env.NODE_ENV = 'development'
      expect(isDev()).toBeTruthy()
      process.env.NODE_ENV = 'dev'
      expect(isDev()).toBeTruthy()
    })

    it('● should validated isTest', async () => {
      expect(isTest()).toBeTruthy()
      process.env.NODE_ENV = 'test'
      expect(isTest()).toBeTruthy()
      process.env.NODE_ENV = 'testing'
      expect(isTest()).toBeTruthy()
    })

    it('● should validated isProd', async () => {
      expect(isProd()).toBeFalsy()
      process.env.NODE_ENV = 'production'
      expect(isProd()).toBeTruthy()
      process.env.NODE_ENV = 'prod'
      expect(isProd()).toBeTruthy()
    })
  })

  describe('⬢ Validate HTTP_STATUS_CODE constants', () => {
    it('● should have the correct status code for 200', () => {
      expect(HTTP_STATUS_CODE[200]).toBe(200)
    })

    it('● should have the correct status code for 401', () => {
      expect(HTTP_STATUS_CODE[401]).toBe(401)
    })

    it('● should have the correct status code for 500', () => {
      expect(HTTP_STATUS_CODE[500]).toBe(500)
    })

    it('● should have the correct status code for 422', () => {
      expect(HTTP_STATUS_CODE[422]).toBe(422)
    })
  })

  describe('⬢ Validate sentry', () => {
    it('● should validate initialize', () => {
      expect(isInitialized()).toBeFalsy()
    })

    it('● should validate getTraceData', () => {
      process.env.NODE_ENV = 'test'
      init({
        dsn: MY_APP_DSN,
        environment: environment(),
      })
      sentryCaptureException('oh no')
      const traceData = getTraceData()
      const traceDataSplitted = traceData.baggage?.split(',') ?? []
      expect(traceData).toBeDefined()
      expect(Object.keys(traceData)).toStrictEqual(['sentry-trace', 'baggage'])
      expect(traceDataSplitted.length).toBeGreaterThan(0)
      expect(traceDataSplitted[0]).toStrictEqual('sentry-environment=test')
    })
  })
})
