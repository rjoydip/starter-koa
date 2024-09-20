import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { router } from '../src/app'
import logger from '../src/logger'
import { captureException, environment, getRegisteredRoutes, HTTP_STATUS_CODE } from '../src/utils'

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

  describe('⬢ HTTP_STATUS_CODE constants', () => {
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
})
