import { describe, expect, it } from 'vitest'
import { ERROR_MESSAGE, HTTP_STATUS_CODE } from '../src/constants'

describe('⬢ Validate constants', () => {
  describe('⬢ ERROR_MESSAGE constants', () => {
    it('● should have the correct AUTH_ERROR message', () => {
      expect(ERROR_MESSAGE.AUTH_ERROR).toBe('AUTH_ERROR')
    })

    it('● should have the correct DB_ERROR message', () => {
      expect(ERROR_MESSAGE.DB_ERROR).toBe('DB_ERROR')
    })

    it('● should have the correct RESPONSE_ERROR message', () => {
      expect(ERROR_MESSAGE.RESPONSE_ERROR).toBe('RESPONSE_ERROR')
    })

    it('● should have the correct INTERNAL_ERROR message', () => {
      expect(ERROR_MESSAGE.INTERNAL_ERROR).toBe('INTERNAL_ERROR')
    })

    it('● should have the correct USER_DATA_ERROR message', () => {
      expect(ERROR_MESSAGE.USER_DATA_ERROR).toBe('USER_DATA_ERROR')
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
