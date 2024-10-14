import type { User } from '../src/types'
import { faker } from '@faker-js/faker/locale/en'
import { HttpMethodEnum } from 'koa-body'
import request from 'supertest'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { app } from '../src/app'
import resolvers from '../src/resolvers'
import { getRouter } from '../src/routers'
import { validateRouter } from '../src/validator'

const {
  person,
  internet,
  phone,
  datatype,
  location,
  string,
} = faker

describe('⬢ Validate validator', () => {
  const { Query } = resolvers
  const app$ = app.callback()

  const testUser: User = {
    name: person.fullName(),
    email: internet.email(),
    phone: phone.number({ style: 'international' }),
    isVerified: datatype.boolean(),
    password: internet.password(),
    address:
      `${location.streetAddress()}, ${location.city()}, ${location.state()}, ${location.zipCode()}, ${location.country()}`,
  }

  afterEach(() => {
    faker.seed()
  })

  describe('⬢ Validate middleware', () => {
    it('● should validated requestValidator POST /api/user', async () => {
      const { headers, status, body } = await request(app$)
        .post('/api/user')
        .send()
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toBe(422)
      expect(body).toStrictEqual({
        statusCode: 422,
        message: 'Missing request data',
      })
    })

    it('● should validated requestValidator invalid data POST /api/user', async () => {
      const { headers, status, body } = await request(app$)
        .post('/api/user')
        .send({
          ...testUser,
          name: null,
        })
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toBe(422)
      expect(body).toStrictEqual({
        statusCode: 422,
        message: 'Invalid request data',
      })
    })

    it('● should validated userValidator GET /api/user/200', async () => {
      const getUserMock = vi.spyOn(Query, 'getUser').mockResolvedValue(
        testUser,
      )
      const { headers, status } = await request(app$)
        .get('/api/user/200')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(getUserMock).toBeCalledTimes(1)
    })

    it('● should validated userValidator GET /api/user/422', async () => {
      const getUserMock = vi.spyOn(Query, 'getUser').mockResolvedValue(
        undefined,
      )
      const { headers, status, body } = await request(app$)
        .get('/api/user/422')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toBe(422)
      expect(body).toStrictEqual({
        statusCode: 422,
        message: 'User Invalid',
      })
      expect(getUserMock).toBeCalledTimes(1)
    })

    it('● should validated userValidator GET /api/user/500', async () => {
      const getUserMock = vi.spyOn(Query, 'getUser').mockRejectedValue(
        new Error('query fetching error'),
      )
      const { headers, status, body } = await request(app$)
        .get(`/api/user/500`)
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toBe(500)
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Update user details failed',
      })
      expect(getUserMock).toBeCalledTimes(1)
    })
  })

  describe('⬢ Validate routes', () => {
    it('● should validated /GET users routes', () => {
      expect(validateRouter(getRouter('GetUsers'))).toBeTruthy()
    })

    it('● should validated /GET user routes', () => {
      expect(validateRouter(getRouter('GetUser'))).toBeTruthy()
    })

    it('● should validated /POST user routes', () => {
      expect(validateRouter(getRouter('PostUser'))).toBeTruthy()
    })

    it('● should validated /PUT user routes', () => {
      expect(validateRouter(getRouter('PutUser'))).toBeTruthy()
    })

    it('● should validated /DELETE user routes', () => {
      expect(validateRouter(getRouter('DeleteUser'))).toBeTruthy()
    })

    it('● should validated invalid route', () => {
      const invalidRouter = getRouter('invalid')
      expect(invalidRouter).toBeNull()
      expect(() => validateRouter(invalidRouter)).toThrowError(
        'Router is empty',
      )
    })

    it('● should validated route name', () => {
      expect(() =>
        validateRouter({
          name: '',
          path: '/api/user',
          method: HttpMethodEnum.GET,
          middleware: [],
          defineHandler: () => Promise.resolve(),
        }),
      ).toThrow('Router name must be a non-empty string')
    })

    it('● should validated route path', () => {
      expect(() =>
        validateRouter({
          name: string.alphanumeric(5),
          path: '',
          method: HttpMethodEnum.GET,
          middleware: [],
          defineHandler: () => Promise.resolve(),
        }),
      ).toThrow('Router path must be a non-empty string')
    })

    it('● should validated route method', () => {
      expect(() =>
        validateRouter({
          name: string.alphanumeric(5),
          path: '/api/user',
          method: 'FOO' as any,
          middleware: [],
          defineHandler: () => Promise.resolve(),
        }),
      ).toThrow('Router method must be a valid HTTP method')
    })

    it('● should validated route middleware', () => {
      expect(() =>
        validateRouter({
          name: string.alphanumeric(5),
          path: '/api/user',
          method: HttpMethodEnum.GET,
          middleware: null as any,
          defineHandler: () => Promise.resolve(),
        }),
      ).toThrow('Router middleware must be an array')
    })
  })
})
