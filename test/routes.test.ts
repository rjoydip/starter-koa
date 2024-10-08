import type { User } from '../src/types'
import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import { tablesDrop } from '../src/db'

describe('⬢ Validate routes', () => {
  const app$ = app.callback()

  const testUser: User = {
    name: 'Benedicte Smans',
    email: 'BenedicteSmans@armyspy.com',
    isVerified: false,
    password: '12345',
    phone: '+(46)0511-7158851',
    address: 'Skolspåret 81, 533 18  LUNDSBRUNN, United States',
  }

  describe.skip('⬢ Validate main routes', () => {
    it('● GET /invalid', async () => {
      const { headers, status } = await request(app$)
        .get('/invalid')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch('text/plain')
      expect(status).toEqual(404)
    })

    it('● GET /', async () => {
      const { headers, status, body } = await request(app$)
        .get('/')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body).toStrictEqual({
        message: 'Welcome to Koa Starter',
        statusCode: 200,
      })
    })

    it('● GET /status', async () => {
      const { headers, status, body } = await request(app$)
        .get('/status')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body).toEqual({
        statusCode: 200,
        message: 'Request successful',
        data: {
          status: 'up',
        },
      })
    })

    it('● GET /health', async () => {
      const { headers, status, body } = await request(app$)
        .get('/health')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body).toEqual({
        statusCode: 200,
        message: 'Request successful',
        data: {
          db: true,
          redis: false,
        },
      })
    })

    it('● GET /metrics', async () => {
      const { headers, status, body } = await request(app$)
        .get('/metrics')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body.message).toStrictEqual('Request successful')
      expect(body.data).toBeDefined()
    })

    it('● GET /openapi', async () => {
      const { headers, status, body } = await request(app$)
        .get('/openapi')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body).toBeDefined()
      expect(typeof body).toStrictEqual('object')
    })

    it('● GET /apidocs', async () => {
      const { headers, status, text, type } = await request(app$)
        .get('/apidocs')
      expect(headers['content-type']).toMatch(/html/)
      expect(status).toEqual(200)
      expect(text).toBeDefined()
      expect(type).toStrictEqual('text/html')
    })

    describe('⬢ Validate graphqlQL routes', () => {
      it('● GET /status', async () => {
        const { status } = await request(app$)
          .get('/status')
        expect(status).toEqual(200)
      })
      it('● GET /graphql', async () => {
        const { status } = await request(app$)
          .get('/graphql')
        expect(status).toEqual(200)
      })
    })
  })

  describe('⬢ Validate user routes', () => {
    let id: string

    it.sequential('● GET /api/users', async () => {
      const { headers, status, body } = await request(app$)
        .get('/api/users')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body.message).toStrictEqual('Fetched all user details successfully')
      expect(body.data.length).toBe(0)
    })

    it.sequential('● POST /api/user', async () => {
      const { headers, status, body } = await request(app$)
        .post('/api/user')
        .send({
          ...testUser,
          address: 'Skolspåret 81, 533 18 LUNDSBRUNN, United States',
        })
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body.message).toStrictEqual('User details stored successfully')
      expect(body.data).toBeDefined()
      id = body.data.id
    })

    it.sequential('● GET /api/user:/:id', async () => {
      const { headers, status, body } = await request(app$)
        .get(`/api/user/${id}`)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body.data).toBeDefined()
      expect(Object.keys(body.data)).toStrictEqual(['id', 'name', 'email', 'phone', 'password', 'address', 'isVerified', 'role', 'createdAt', 'updatedAt'])
    })

    it.sequential('● PATCH /api/user:/:id', async () => {
      const { headers, status, body } = await request(app$)
        .patch(`/api/user/${id}`)
        .send(testUser)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body.message).toStrictEqual('User details updates successfully')
      expect(body.data).toBeDefined()
    })

    it.sequential('● DELETE /api/user:/:id', async () => {
      const { headers, status, body } = await request(app$)
        .delete(`/api/user/${id}`)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body.message).toStrictEqual('User delete successfully')
      expect(body.data).toBeDefined()
    })

    it.sequential('● DELETE /api/user:/:id status 422', async () => {
      const { headers, status } = await request(app$)
        .delete(`/api/user/${id}`)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(422)
    })

    it.sequential('● PATCH /api/user:/:throw', async () => {
      const { headers, status, body } = await request(app$)
        .patch(`/api/user/${id}`)
        .send({
          ...testUser,
          name: 'Benedicte Smans Marlou Schaminée',
        })
        .set('Accept', 'application/json')
      expect(status).toEqual(422)
      expect(headers['content-type']).toMatch(/json/)
      expect(body).toStrictEqual({
        message: 'User Invalid',
        statusCode: 422,
      })
    })

    it.sequential('● GET /api/user/:deleted-user', async () => {
      const { headers, status, body } = await request(app$)
        .get(`/api/user/${id}`)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(422)
      expect(body).toStrictEqual({
        statusCode: 422,
        message: 'User Invalid',
      })
    })

    it.sequential('● DELETE /api/user:/:wrong-id', async () => {
      const deleteUserResponse = await request(app$)
        .delete('/api/user/wrong-id')
        .set('Accept', 'application/json')
      expect(deleteUserResponse.headers['content-type']).toMatch(/json/)
      expect(deleteUserResponse.status).toEqual(500)
    })
  })

  describe.skip('⬢ Validate routing when table dropped', () => {
    const id = 1
    beforeAll(async () => {
      await tablesDrop()
    })

    it('● GET /api/users 500', async () => {
      const { headers, status } = await request(app$)
        .get('/api/users')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(500)
    })

    it('● GET /api/user/:id 500', async () => {
      const { headers, status } = await request(app$)
        .get(`/api/user/${id}`)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(500)
    })

    it('● POST /api/user 500', async () => {
      const { headers, status } = await request(app$)
        .post('/api/user/')
        .send(testUser)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(500)
    })

    it('● PUT /api/user/:id 500', async () => {
      const { headers, status } = await request(app$)
        .delete(`/api/user/${id}`)
        .send({
          id,
          ...testUser,
        })
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(500)
    })

    it('● DELETE /api/user:/:id 500', async () => {
      const deleteUserResponse = await request(app$)
        .delete(`/api/user/${id}`)
        .set('Accept', 'application/json')
      expect(deleteUserResponse.headers['content-type']).toMatch(/json/)
      expect(deleteUserResponse.status).toEqual(500)
    })
  })
})
