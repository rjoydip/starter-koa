import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import app from '../src/app'
import { dbDown, initDB, tablesDrop } from '../src/db'
import { getRouter, validateRouter } from '../src/routers'

function validate(name: string) {
  return validateRouter(getRouter(name))
}

describe('⬢ Validate routes', () => {
  beforeAll(async () => {
    await initDB()
  })

  afterAll(async () => {
    await dbDown()
  })

  describe('⬢ Validate main routes', () => {
    it('● should validated invalid route', async () => {
      const invalidRouter = getRouter('invalid')
      expect(invalidRouter).toBeNull()
      expect(() => validateRouter(invalidRouter)).toThrowError('Router is empty')
    })

    it('● should validated / route', async () => {
      expect(validate('Index')).toBeTruthy()
    })

    it('● should validated /status route', async () => {
      expect(validate('Status')).toBeTruthy()
    })

    it('● should validated /health route', async () => {
      expect(validate('Health')).toBeTruthy()
    })

    it('● GET /', async () => {
      const { headers, status, body } = await request(app.callback())
        .get('/')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body).toStrictEqual({
        message: 'Index',
        data: {},
        error: {},
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
        data: {
          status: 'up',
        },
        error: {},
      })
    })

    it('● GET /invalid', async () => {
      const { headers, status, body } = await request(app.callback())
        .get('/invalid')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(404)
      expect(body).toEqual({
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
        data: {
          db: true,
          redis: false,
        },
        error: {},
      })
    })
  })

  describe('⬢ Validate user routes', () => {
    it('● should validated /GET users routes', async () => {
      expect(validate('GetUsers')).toBeTruthy()
    })

    it('● should validated /GET user routes', async () => {
      expect(validate('GetUser')).toBeTruthy()
    })

    it('● should validated /POST user routes', async () => {
      expect(validate('PostUser')).toBeTruthy()
    })

    it('● should validated /PUT user routes', async () => {
      expect(validate('PutUser')).toBeTruthy()
    })

    it('● should validated /DELETE user routes', async () => {
      expect(validate('DeleteUser')).toBeTruthy()
    })

    let _id: string

    it.sequential('● POST /user', async () => {
      const validResponse = await request(app.callback())
        .post('/user')
        .send({
          name: 'Benedicte Smans',
          email: 'test@test.com',
          address: 'Skolspåret 81, 533 18  LUNDSBRUNN, United States',
          phone: '+(46)0511-7158851',
        })
        .set('Accept', 'application/json')
      expect(validResponse.headers['content-type']).toMatch(/json/)
      expect(validResponse.status).toEqual(200)
      expect(validResponse.body.data).toBeDefined()
      expect(Object.keys(validResponse.body)).toStrictEqual(['message', 'data', 'error'])
      expect(Object.keys(validResponse.body.data)).toStrictEqual(['_id', 'name', 'email', 'phone', 'address'])

      _id = validResponse.body.data._id

      const invalidResponse = await request(app.callback())
        .post('/user')
        .send({
          name: 'Test',
          email: 'BenedicteSmans@armyspy.com',
          address: 'Skolspåret 81, 533 18  LUNDSBRUNN, United States',
          phone: '+(46)0511-7158851',
        })
        .set('Accept', 'application/json')
      expect(invalidResponse.headers['content-type']).toMatch(/json/)
      expect(invalidResponse.status).toEqual(422)
      expect(invalidResponse.body.error.length).toBe(1)
      expect(invalidResponse.body.error[0].input).toStrictEqual('Test')
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
        .send({
          name: 'Benedicte Smans',
          email: 'BenedicteSmans@armyspy.com',
          address: 'Skolspåret 81, 533 18  LUNDSBRUNN, United States',
          phone: '+(46)0511-7158851',
        })
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body.data).toBeDefined()
      expect(Object.keys(body.data)).toStrictEqual(['_id', 'name', 'email', 'phone', 'address'])
      expect(body.data.email).toStrictEqual('BenedicteSmans@armyspy.com')
      expect(body.data.phone).toStrictEqual('+(46)0511-7158851')
    })

    it('● PUT /user:/:wrong-id', async () => {
      const { headers, status, body } = await request(app.callback())
        .put('/user/wrong-id')
        .send({
          _id: 'xxxx',
          name: 'Benedicte Smans',
          email: 'BenedicteSmans1@armyspy.com',
          address: 'Skolspåret 81, 533 18  LUNDSBRUNN',
          phone: '+(46)0511-7158851',
        })
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(401)
      expect(body).toStrictEqual({
        message: 'User Invalid',
        data: {},
        error: {},
      })
    })

    it.sequential('● PUT /user:/:throw', async () => {
      const { headers, status, body } = await request(app.callback())
        .put(`/user/${_id}`)
        .send({
          _id: 'xxxx',
          name: 'Benedicte Smans Marlou Schaminée',
          email: 'BenedicteSmans@armyspy.com',
          address: 'Skolspåret 81, 533 18  LUNDSBRUNN',
          phone: '+(46)0511-7158851',
        })
        .set('Accept', 'application/json')
      expect(status).toEqual(500)
      expect(headers['content-type']).toMatch(/json/)
      expect(body).toStrictEqual({
        message: 'User updates failed',
        data: {},
        error: {
          kind: 'response',
          type: 'string',
          message: 'value too long for type character varying(30)',
        },
      })
    })

    it.sequential('● GET /users', async () => {
      const { headers, status, body } = await request(app.callback())
        .get('/users')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body.data.length).toBe(1)
      expect(Object.keys(body.data[0])).toStrictEqual(['_id', 'name', 'email', 'phone', 'address'])
    })

    it.sequential('● DELETE /user:/:id', async () => {
      const deleteUserResponse = await request(app.callback())
        .delete(`/user/${_id}`)
        .set('Accept', 'application/json')
      expect(deleteUserResponse.headers['content-type']).toMatch(/json/)
      expect(deleteUserResponse.status).toEqual(200)
    })

    it.sequential('● GET /user/:deleted-user', async () => {
      const { headers, status, body } = await request(app.callback())
        .get(`/user/${_id}`)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(422)
      expect(body.data).toStrictEqual({})
      expect(body.error).toStrictEqual({
        kind: 'response',
        type: 'string',
        message: 'Invalid user id',
      })
    })

    it('● DELETE /user:/:wrong-id', async () => {
      const deleteUserResponse = await request(app.callback())
        .delete('/user/wrong-id')
        .set('Accept', 'application/json')
      expect(deleteUserResponse.headers['content-type']).toMatch(/json/)
      expect(deleteUserResponse.status).toEqual(401)
    })

    describe('⬢ Validate users when table non-exists', () => {
      beforeAll(async () => {
        await tablesDrop()
      })

      it('● GET /users error', async () => {
        const { headers, status } = await request(app.callback())
          .get('/users')
          .set('Accept', 'application/json')
        expect(headers['content-type']).toMatch(/json/)
        expect(status).toEqual(500)
      })

      it('● GET /user/:id error', async () => {
        const { headers, status } = await request(app.callback())
          .get(`/user/${_id}`)
          .set('Accept', 'application/json')
        expect(headers['content-type']).toMatch(/json/)
        expect(status).toEqual(500)
      })

      it('● POST /user error', async () => {
        const { headers, status } = await request(app.callback())
          .post('/user/')
          .send({
            _id: 'xxxx',
            name: 'Benedicte Smans Marlou Schaminée',
            email: 'BenedicteSmans@armyspy.com',
            address: 'Skolspåret 81, 533 18  LUNDSBRUNN',
            phone: '+(46)0511-7158851',
          })
          .set('Accept', 'application/json')
        expect(headers['content-type']).toMatch(/json/)
        expect(status).toEqual(500)
      })

      it('● PUT /user/:id error', async () => {
        const { headers, status } = await request(app.callback())
          .put(`/user/${_id}`)
          .send({
            _id: 'xxxx',
            name: 'Benedicte Smans Marlou Schaminée',
            email: 'BenedicteSmans@armyspy.com',
            address: 'Skolspåret 81, 533 18  LUNDSBRUNN',
            phone: '+(46)0511-7158851',
          })
          .set('Accept', 'application/json')
        expect(headers['content-type']).toMatch(/json/)
        expect(status).toEqual(500)
      })

      it('● DELETE /user:/:id', async () => {
        const deleteUserResponse = await request(app.callback())
          .delete(`/user/${_id}`)
          .set('Accept', 'application/json')
        expect(deleteUserResponse.headers['content-type']).toMatch(/json/)
        expect(deleteUserResponse.status).toEqual(500)
      })
    })
  })

  describe('⬢ Validate registered routes', () => {
    it('● should validated route name', async () => {
      expect(() => validateRouter({
        name: '',
        path: '/',
        method: 'GET',
        middleware: [],
        handler: () => Promise.resolve(),
      })).toThrow('Router name must be a non-empty string')
    })
    it('● should validated route path', async () => {
      expect(() => validateRouter({
        name: 'xxxx',
        path: '',
        method: 'GET',
        middleware: [],
        handler: () => Promise.resolve(),
      })).toThrow('Router path must be a non-empty string')
    })
    it('● should validated route method', async () => {
      expect(() => validateRouter({
        name: 'xxxx',
        path: '/',
        method: 'FOO',
        middleware: [],
        handler: () => Promise.resolve(),
      })).toThrow('Router method must be a valid HTTP method')
    })
    it('● should validated route middleware', async () => {
      expect(() => validateRouter({
        name: 'xxxx',
        path: '/',
        method: 'GET',
        middleware: null as any,
        handler: () => Promise.resolve(),
      })).toThrow('Router middleware must be an array')
    })
    it('● should validated route handler', async () => {
      expect(() => validateRouter({
        name: 'xxxx',
        path: '/',
        method: 'GET',
        middleware: [],
        handler: null as any,
      })).toThrow('Router handler must be a function')
    })
  })
})
