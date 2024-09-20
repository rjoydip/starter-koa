import type { HttpMethod } from 'koa-body'
import { HttpMethodEnum } from 'koa-body'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import app from '../src/app'
import { dbDown, initDB, tablesDrop } from '../src/db'
import { getRouter, requestValidatorMiddleware, userValidatorMiddleware, validateRouter } from '../src/routers'
import { UserSchema } from '../src/schema'

describe('⬢ Validate routes', () => {
  const testUser = {
    name: 'Benedicte Smans',
    email: 'BenedicteSmans@armyspy.com',
    address: 'Skolspåret 81, 533 18  LUNDSBRUNN, United States',
    phone: '+(46)0511-7158851',
  }

  beforeAll(async () => {
    await initDB()
  })

  afterAll(async () => {
    await dbDown()
  })

  describe('⬢ Validate middlewares', () => {
    it('● should validated requestValidatorMiddleware /GET ', async () => {
      app.use(requestValidatorMiddleware(UserSchema))
      const { body, headers, status } = await request(app.callback()).get('/')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body).toStrictEqual({
        message: 'Index',
        statusCode: 200,
        data: {},
      })
    })

    it('● should validated requestValidatorMiddleware /POST user', async () => {
      app.use(requestValidatorMiddleware(UserSchema))
      const { headers, status, body } = await request(app.callback())
        .post('/user')
        .send({
          ...testUser,
          name: null,
        })
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toBe(422)
      expect(body).toStrictEqual({
        statusCode: 422,
        message: 'Missing request data',
      })
    })

    it('● should validated userValidatorMiddleware /POST user no payload', async () => {
      app.use(userValidatorMiddleware())
      const requestOne = await request(app.callback())
        .post('/user')
        .send(testUser)
        .set('Accept', 'application/json')
      expect(requestOne.headers['content-type']).toMatch(/json/)
      expect(requestOne.status).toEqual(200)
      expect(requestOne.body.data).toBeDefined()
      expect(Object.keys(requestOne.body)).toStrictEqual(['data', 'statusCode', 'message'])
      expect(Object.keys(requestOne.body.data)).toStrictEqual(['_id', 'name', 'email', 'phone', 'address'])

      const requestTwo = await request(app.callback())
        .post(`/user/${requestOne.body.data._id}`)
        .send()
      expect(requestTwo.headers['content-type']).toMatch(/json/)
      expect(requestTwo.status).toBe(422)
      expect(requestTwo.body).toStrictEqual({
        statusCode: 422,
        message: 'Missing request data',
        data: {},
      })
    })

    it('● should validated requestValidatorMiddleware /POST', async () => {
      app.use(requestValidatorMiddleware(UserSchema))
      const { headers, status, body } = await request(app.callback())
        .post('/user')
        .send(testUser)
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toBe(200)
      expect(body).toStrictEqual({
        statusCode: 200,
        message: 'User details stored successfully',
        data: body.data,
      })
    })
  })

  describe('⬢ Validate validateRouter', () => {
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

    it('● should validated / route', async () => {
      expect(validateRouter(getRouter('Index'))).toBeTruthy()
    })

    it('● should validated /status route', async () => {
      expect(validateRouter(getRouter('Status'))).toBeTruthy()
    })

    it('● should validated /health route', async () => {
      expect(validateRouter(getRouter('Health'))).toBeTruthy()
    })

    it('● should validated route name', async () => {
      expect(() => validateRouter({
        name: '',
        path: '/',
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
        path: '/',
        method: 'FOO' as HttpMethod,
        middleware: [],
        handler: () => Promise.resolve(),
      })).toThrow('Router method must be a valid HTTP method')
    })

    it('● should validated route middleware', async () => {
      expect(() => validateRouter({
        name: 'xxxx',
        path: '/',
        method: HttpMethodEnum.GET,
        middleware: null as any,
        handler: () => Promise.resolve(),
      })).toThrow('Router middleware must be an array')
    })

    it('● should validated route handler', async () => {
      expect(() => validateRouter({
        name: 'xxxx',
        path: '/',
        method: HttpMethodEnum.GET,
        middleware: [],
        handler: null as any,
      })).toThrow('Router handler must be a function')
    })
  })

  describe('⬢ Validate main routes', () => {
    it('● GET /', async () => {
      const { headers, status, body } = await request(app.callback())
        .get('/')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body).toStrictEqual({
        message: 'Index',
        statusCode: 200,
        data: {},
      })
    })

    it('● GET /status', async () => {
      const { headers, status, body } = await request(app.callback())
        .get('/status')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body).toEqual({
        message: 'Status',
        statusCode: 200,
        data: {
          status: 'up',
        },
      })
    })

    it('● GET /invalid', async () => {
      const { headers, status, body } = await request(app.callback())
        .get('/invalid')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(404)
      expect(body).toEqual({
        statusCode: 404,
        message: 'Route Not Found',
      })
    })

    it('● GET /health', async () => {
      const { headers, status, body } = await request(app.callback())
        .get('/health')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body).toEqual({
        message: 'Health',
        statusCode: 200,
        data: {
          db: true,
          redis: false,
        },
      })
    })
  })

  describe('⬢ Validate routing', () => {
    let _id: string

    it('● GET /users', async () => {
      const { headers, status, body } = await request(app.callback())
        .get('/users')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body.message).toStrictEqual('Fetched all user details successfully')
      expect(body.data.length).toBeGreaterThan(0)
    })

    it('● PUT /user:/:wrong-id', async () => {
      const { headers, status, body } = await request(app.callback())
        .put('/user/wrong-id')
        .send(testUser)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(500)
      expect(body).toStrictEqual({
        message: 'Update user details failed',
        statusCode: 500,
      })
    })

    it('● POST /user', async () => {
      const { headers, status, body } = await request(app.callback())
        .post('/user')
        .send({
          ...testUser,
          address: 'Skolspåret 81, 533 18 LUNDSBRUNN, United States',
        })
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body).toStrictEqual({
        statusCode: 200,
        message: 'User details stored successfully',
        data: {
          _id: expect.anything(),
          name: 'Benedicte Smans',
          email: 'BenedicteSmans@armyspy.com',
          phone: '+(46)0511-7158851',
          address: 'Skolspåret 81, 533 18 LUNDSBRUNN, United States',
        },
      })
      _id = body.data._id
    })

    it.sequential('● GET /user:/:id', async () => {
      const { headers, status, body } = await request(app.callback())
        .get(`/user/${_id}`)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body.data).toBeDefined()
      expect(Object.keys(body.data)).toStrictEqual(['_id', 'name', 'email', 'phone', 'address'])
    })

    it.sequential('● PUT /user:/:id', async () => {
      const { headers, status, body } = await request(app.callback())
        .put(`/user/${_id}`)
        .send(testUser)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body).toStrictEqual({
        statusCode: 200,
        message: 'User details updates successfully',
        data: {
          _id: expect.anything(),
          name: 'Benedicte Smans',
          email: 'BenedicteSmans@armyspy.com',
          phone: '+(46)0511-7158851',
          address: 'Skolspåret 81, 533 18  LUNDSBRUNN, United States',
        },
      })
    })

    it.sequential('● DELETE /user:/:id status 500', async () => {
      const db = await import('../src/db')
      vi.spyOn(db, 'deleteUser').mockRejectedValueOnce(new Error('DB unable to take transaction'))
      const { headers, status } = await request(app.callback())
        .delete(`/user/${_id}`)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(500)
    })

    it.sequential('● PUT /user:/:throw', async () => {
      const { headers, status, body } = await request(app.callback())
        .put(`/user/${_id}`)
        .send({
          ...testUser,
          name: 'Benedicte Smans Marlou Schaminée',
        })
        .set('Accept', 'application/json')
      expect(status).toEqual(500)
      expect(headers['content-type']).toMatch(/json/)
      expect(body).toStrictEqual({
        message: 'User details updates failed',
        statusCode: 500,
      })
    })

    it.sequential('● DELETE /user:/:id', async () => {
      const { headers, status, body } = await request(app.callback())
        .delete(`/user/${_id}`)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body).toStrictEqual({
        statusCode: 200,
        message: 'User delete successfully',
        data: expect.anything(),
      })
    })

    it.sequential('● GET /user/:deleted-user', async () => {
      const { headers, status, body } = await request(app.callback())
        .get(`/user/${_id}`)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(422)
      expect(body).toStrictEqual({
        statusCode: 422,
        message: 'User Invalid',
      })
    })

    it('● DELETE /user:/:wrong-id', async () => {
      const deleteUserResponse = await request(app.callback())
        .delete('/user/wrong-id')
        .set('Accept', 'application/json')
      expect(deleteUserResponse.headers['content-type']).toMatch(/json/)
      expect(deleteUserResponse.status).toEqual(500)
    })
  })

  describe('⬢ Validate routing when table dropped', () => {
    const _id = 'c8d4db90-c19a-4f64-bb47-72c933a9a32e'
    beforeAll(async () => {
      await tablesDrop()
    })

    it('● GET /users 500', async () => {
      const { headers, status } = await request(app.callback())
        .get('/users')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(500)
    })

    it('● GET /user/:id 500', async () => {
      const { headers, status } = await request(app.callback())
        .get(`/user/${_id}`)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(500)
    })

    it('● POST /user 500', async () => {
      const { headers, status } = await request(app.callback())
        .post('/user/')
        .send(testUser)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(500)
    })

    it('● PUT /user/:id 500', async () => {
      const { headers, status } = await request(app.callback())
        .delete(`/user/${_id}`)
        .send({
          _id: 'xxxx',
          ...testUser,
        })
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(500)
    })

    it('● DELETE /user:/:id 500', async () => {
      const deleteUserResponse = await request(app.callback())
        .delete(`/user/${_id}`)
        .set('Accept', 'application/json')
      expect(deleteUserResponse.headers['content-type']).toMatch(/json/)
      expect(deleteUserResponse.status).toEqual(500)
    })
  })
})
