import { readFile } from 'node:fs/promises'
import { env } from 'node:process'
import {
  getTraceData,
  init,
  isInitialized,
  captureException as sentryCaptureException,
} from '@sentry/node'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import logger from '../src/logger'
import {
  API_PREFIX,
  captureException,
  environment,
  getOpenAPISpec,
  getRuntime,
  HTTP_STATUS_CODE,
  invariant,
  isDev,
  isProd,
  isTest,
  wsTemplete,
} from '../src/utils'

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}))

describe('⬢ Validate utils', () => {
  const MY_APP_DSN = 'http://acacaeaccacacacabcaacdacdacadaca@sentry.io/000001'
  const mockLoggerError = vi.spyOn(logger, 'error').mockImplementation(
    () => {},
  )
  let originalEnv

  beforeEach(() => {
    vi.clearAllMocks()
    originalEnv = { ...env }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('● should validated exported value', () => {
    expect(API_PREFIX).toStrictEqual('/api')
  })

  it('● should return the content of the openapi.yaml file as a string', async () => {
    const mockOpenAPISpec = 'openapi: 3.0.0\ninfo:\n  title: Test API';
    (readFile as any).mockResolvedValue(mockOpenAPISpec)
    const result = await getOpenAPISpec()
    expect(result).toBe(mockOpenAPISpec)
    expect(readFile).toHaveBeenCalledWith('./src/openapi.yaml', {
      encoding: 'utf8',
    })
  })

  it('● should throw an error if reading the file fails', async () => {
    const error = new Error('File not found');
    (readFile as any).mockRejectedValue(error)
    await expect(getOpenAPISpec()).rejects.toThrow('File not found')
  })

  describe('⬢ Validate utility methods', () => {
    it('● should validated wsTemplate', () => {
      expect(wsTemplete()).toBeDefined()
      expect(wsTemplete({ sse: true })).toBeDefined()
    })

    describe('⬢ Validate invariant', () => {
      it('● should validated invariant for prod', () => {
        expect(() => invariant(false, 'production message')).toThrowError(
          'Invariant failed',
        )
        expect(() => invariant(false, undefined)).toThrowError(
          'Invariant failed',
        )
        expect(mockLoggerError).toHaveBeenCalledTimes(0)
      })

      it('● should validated invariant for no-prod', () => {
        expect(() => invariant(true, 'development message')).not.throw()
        expect(mockLoggerError).toHaveBeenCalledTimes(0)
      })
    })

    describe('⬢ Validate captureException', () => {
      it('● should validated captureException for prod', () => {
        env.NODE_ENV = 'production'
        expect(() => captureException('production message')).toThrowError(
          'Invariant failed',
        )
        expect(mockLoggerError).toBeCalledWith('production message')
        expect(mockLoggerError).toHaveBeenCalledTimes(1)
      })

      it('● should validated captureException for non-prod', () => {
        env.NODE_ENV = 'development'
        expect(() => captureException('development message')).not.throw()
        expect(mockLoggerError).toHaveBeenCalledTimes(0)
      })
    })

    describe('⬢ Validate environment', () => {
      it('● should validated test environment', () => {
        env.NODE_ENV = 'test'
        expect(environment()).toStrictEqual('test')
      })

      it('● should validated production environment', () => {
        env.NODE_ENV = 'production'
        expect(environment()).toStrictEqual('production')
      })

      it('● should validated development environment', () => {
        env.NODE_ENV = 'development'
        expect(environment()).toStrictEqual('development')
      })

      it('● should validated deleted environment', () => {
        delete env.NODE_ENV
        expect(environment()).toStrictEqual('development')
      })
    })

    describe('⬢ Validate is*Env', () => {
      it('● should validated isDev', () => {
        delete env.NODE_ENV
        expect(isDev()).toBeFalsy()
        env.NODE_ENV = 'development'
        expect(isDev()).toBeTruthy()
        env.NODE_ENV = 'dev'
        expect(isDev()).toBeTruthy()
      })

      it('● should validated isTest', () => {
        env.NODE_ENV = 'test'
        expect(isTest()).toBeTruthy()
        env.NODE_ENV = 'testing'
        expect(isTest()).toBeTruthy()
      })

      it('● should validated isProd', () => {
        expect(isProd()).toBeFalsy()
        env.NODE_ENV = 'production'
        expect(isProd()).toBeTruthy()
        env.NODE_ENV = 'prod'
        expect(isProd()).toBeTruthy()
      })
    })

    describe('⬢ Validate platform & runtime', () => {
      it('● should validated node runtime', () => {
        expect(getRuntime()).toStrictEqual('node')
      })
      it('● should validated bun runtime', () => {
        globalThis.Bun as unknown as typeof import('bun')
        globalThis.Bun = {
          ...globalThis.Bun,
          env: {},
        }
        expect(getRuntime()).toStrictEqual('bun')
      })
      it('● should validated deno runtime', () => {
        globalThis.bun = undefined
        globalThis.Deno as unknown as typeof Deno
        globalThis.Deno = {
          ...globalThis.Deno,
        }
        expect(getRuntime()).toStrictEqual('deno')
      })
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
      env.NODE_ENV = 'test'
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
