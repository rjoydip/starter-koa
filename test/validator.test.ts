import type { HttpMethod } from 'koa-body'
import { HttpMethodEnum } from 'koa-body'
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { app } from '../src/app'
import resolvers from '../src/resolvers'
import { getRouter } from '../src/routers'
import { validateRouter } from '../src/validator'

const { Query } = resolvers
const appInstance = app.callback()

describe('⬢ Validate validator', () => {
  describe('⬢ Validate middleware', () => {
    const testUser = {
      name: 'Benedicte Smans',
      email: 'BenedicteSmans@armyspy.com',
      address: 'Skolspåret 81, 533 18  LUNDSBRUNN, United States',
      phone: '+(46)0511-7158851',
    }

    it('● should validated requestValidator POST /api/user', async () => {
      const { headers, status, body } = await request(appInstance)
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
      const { headers, status, body } = await request(appInstance)
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
      const getUserMock = vi.spyOn(Query, 'getUser').mockResolvedValue(testUser)
      const { headers, status } = await request(appInstance)
        .get('/api/user/200')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(getUserMock).toBeCalledTimes(1)
    })

    it('● should validated userValidator GET /api/user/422', async () => {
      const getUserMock = vi.spyOn(Query, 'getUser').mockResolvedValue(undefined)
      const { headers, status, body } = await request(appInstance)
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
      const getUserMock = vi.spyOn(Query, 'getUser').mockRejectedValue(new Error('query fetching error'))
      const { headers, status, body } = await request(appInstance)
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
    it('● should validated /GET users routes', async () => {
      expect(validateRouter(getRouter('GetUsers'))).toBeTruthy()
    })

    it('● should validated /GET user routes', async () => {
      expect(validateRouter(getRouter('GetUser'))).toBeTruthy()
    })

    it('● should validated /POST user routes', async () => {
      expect(validateRouter(getRouter('PostUser'))).toBeTruthy()
    })

    it('● should validated /PUT user routes', async () => {
      expect(validateRouter(getRouter('PutUser'))).toBeTruthy()
    })

    it('● should validated /DELETE user routes', async () => {
      expect(validateRouter(getRouter('DeleteUser'))).toBeTruthy()
    })

    it('● should validated invalid route', async () => {
      const invalidRouter = getRouter('invalid')
      expect(invalidRouter).toBeNull()
      expect(() => validateRouter(invalidRouter)).toThrowError('Router is empty')
    })

    it('● should validated route name', async () => {
      expect(() => validateRouter({
        name: '',
        path: '/api/users',
        method: HttpMethodEnum.GET,
        middleware: [],
        handler: () => Promise.resolve(),
      })).toThrow('Router name must be a non-empty string')
    })

    it('● should validated route path', async () => {
      expect(() => validateRouter({
        name: 'xxxx',
        path: '',
        method: HttpMethodEnum.GET,
        middleware: [],
        handler: () => Promise.resolve(),
      })).toThrow('Router path must be a non-empty string')
    })

    it('● should validated route method', async () => {
      expect(() => validateRouter({
        name: 'xxxx',
        path: '/api/users',
        method: 'FOO' as HttpMethod,
        middleware: [],
        handler: () => Promise.resolve(),
      })).toThrow('Router method must be a valid HTTP method')
    })

    it('● should validated route middleware', async () => {
      expect(() => validateRouter({
        name: 'xxxx',
        path: '/api/users',
        method: HttpMethodEnum.GET,
        middleware: null as any,
        handler: () => Promise.resolve(),
      })).toThrow('Router middleware must be an array')
    })

    it('● should validated route handler', async () => {
      expect(() => validateRouter({
        name: 'xxxx',
        path: '/api/users',
        method: HttpMethodEnum.GET,
        middleware: [],
        handler: null as any,
      })).toThrow('Router handler must be a function')
    })
  })
})
