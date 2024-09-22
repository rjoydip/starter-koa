import { describe, expect, it } from 'vitest'
import { createError, createSuccess, hasProp, sanitizeStatusCode, sanitizeStatusMessage } from '../src/message'

describe('⬢ Validate message', () => {
  describe('⬢ Validate sanitizeStatusMessage', () => {
    it('● should validate statusMessage', () => {
      expect(sanitizeStatusMessage('&<>"\'')).toStrictEqual('&amp;&lt;&gt;&quot;&#39;')
      expect(sanitizeStatusMessage('🦄 & 🐐')).toStrictEqual('🦄 &amp; 🐐')
      expect(sanitizeStatusMessage('Hello <em>World</em>')).toStrictEqual('Hello &lt;em&gt;World&lt;/em&gt;')
    })
  })

  describe('⬢ Validate sanitizeStatusCode', () => {
    it('● should validate statusCode string', () => {
      expect(sanitizeStatusCode('200')).toStrictEqual(200)
      expect(sanitizeStatusCode('1000')).toStrictEqual(200)
    })
    it('● should validate statusCode ', () => {
      expect(sanitizeStatusCode(200)).toStrictEqual(200)
      expect(sanitizeStatusCode(1000)).toStrictEqual(200)
    })
  })

  describe('⬢ Validate hasProp', () => {
    it('● should validate hasProp exists', () => {
      expect(hasProp({ a: 1, b: { c: 1 } }, 'a')).toBeTruthy()
    })
    it('● should validate hasProp not-exists', () => {
      expect(hasProp({ a: 1, b: { c: 1 } }, 'd')).toBeFalsy()
      expect(hasProp(1, '0')).toBeFalsy()
    })
  })

  describe('⬢ Validate creaseSuccess', () => {
    it('● should validate succes message', () => {
      const data = { id: 1, name: 'Test User' }
      expect(createSuccess({ data })).toStrictEqual({
        statusCode: 200,
        message: 'Request successful',
        data,
      })
    })

    it('● should validate succes string', () => {
      expect(createSuccess('Success message')).toStrictEqual({
        message: 'Success message',
        statusCode: 200,
      })
      expect(createSuccess('')).toStrictEqual({
        message: '',
        statusCode: 200,
      })
    })

    it('● should return a custom message', () => {
      const data = { id: 1, name: 'Test User' }
      const message = 'Custom success message'

      expect(createSuccess({ data, message })).toStrictEqual({
        statusCode: 200,
        message,
        data,
      })
    })

    it('● should return a message with data', () => {
      const data = { id: 1, name: 'Test User' }

      expect(createSuccess({ data, message: 'Operation successful' })).toStrictEqual({
        statusCode: 200,
        message: 'Operation successful',
        data,
      })
    })
  })

  describe('⬢ Validate createError', () => {
    it('● should return an error message', () => {
      expect(createError('Database connection failed').toJSON()).toStrictEqual({ message: 'Database connection failed', statusCode: 500 })
    })

    it('● should return an custom error message', () => {
      expect(createError({
        message: 'Database connection occurred',
      }).toJSON()).toStrictEqual({ message: 'Database connection occurred', statusCode: 500 })
    })

    it('● should return an error message when native Error', () => {
      expect(
        createError(new Error('Native Error')).toJSON(),
      ).toStrictEqual({ message: 'Native Error', statusCode: 500 })

      expect(
        createError({
          statusMessage: new Error('Native Error').message,
        }).toJSON(),
      ).toStrictEqual({ message: 'Native Error', statusCode: 500 })

      expect(
        createError(
          createError({
            message: 'Error',
          }),
        ).toJSON(),
      ).toStrictEqual({ message: 'Error', statusCode: 500 })
    })

    it('● should return a failure response with missing error fields filled with defaults', () => {
      expect(createError('Request failed').toJSON()).toStrictEqual({ message: 'Request failed', statusCode: 500 })
    })

    it('● should can inherit from cause', async () => {
      class CustomError extends Error {
        cause = createError({
          statusCode: 400,
          statusMessage: 'Bad Error',
          unhandled: true,
          fatal: true,
        })
      }

      const t = createError(new CustomError())

      expect(t.unhandled).toBe(true)
      expect(t.fatal).toBe(true)
    })

    it('● should can inherit from status', async () => {
      class CustomError extends Error {
        cause = createError({
          status: 400,
          unhandled: true,
          fatal: true,
        })
      }

      const t = createError(new CustomError())

      expect(t.unhandled).toBe(true)
      expect(t.fatal).toBe(true)
    })

    it('● should can inherit from statusCode', async () => {
      class CustomError extends Error {
        cause = {
          statusCode: 400,
          unhandled: false,
          fatal: false,
        }
      }

      const t = createError(new CustomError())

      expect(t.unhandled).toBe(false)
      expect(t.fatal).toBe(false)
    })

    it('● should can inherit from statusMessage', async () => {
      class CustomError extends Error {
        cause = {
          statusMessage: 'Bad Error',
          unhandled: false,
          fatal: false,
        }
      }

      const t = createError(new CustomError())

      expect(t.unhandled).toBe(false)
      expect(t.fatal).toBe(false)
    })
  })
})
