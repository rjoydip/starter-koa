import type { UserInput } from '../src/schema.ts'
import { faker } from '@faker-js/faker/locale/en'
import request from 'supertest'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { app } from '../src/app.ts'
import { db } from '../src/db.ts'
import resolvers from '../src/resolvers.ts'

const {
  person,
  internet,
  phone,
  datatype,
  location,
  string,
} = faker

describe('⬢ Validate routes', () => {
  const app$ = app.callback()

  const testUser: UserInput = {
    name: person.fullName(),
    email: internet.email(),
    phone: phone.number({ style: 'international' }),
    isVerified: datatype.boolean(),
    password: internet.password(),
    address: `${location.streetAddress()}, ${location.city()}, ${location.state()}, ${location.zipCode()}, ${location.country()}`,
    role: 'admin',
  }

  beforeAll(async () => {})

  afterEach(() => {
    faker.seed()
  })

  afterAll(async () => {})

  describe('⬢ Validate main routes', () => {
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
          redis: true,
        },
      })
    })

    it('● GET /metrics', async () => {
      const { headers, status, body } = await request(app$)
        .get('/_metrics')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body.message).toStrictEqual('Request successful')
      expect(body.data).toBeDefined()
    })

    it('● GET /_meta', async () => {
      const { headers, status, body } = await request(app$)
        .get('/_meta')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body.message).toStrictEqual('Request successful')
      expect(body.data).toBeDefined()
      expect(Object.keys(body.data)).toStrictEqual([
        'description',
        'name',
        'license',
        'version',
      ])
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

    it('● GET /references', async () => {
      const { headers, status, text, type } = await request(app$)
        .get('/references')
      expect(headers['content-type']).toMatch(/html/)
      expect(status).toEqual(200)
      expect(text).toBeDefined()
      expect(type).toStrictEqual('text/html')
    })

    it('● GET /_ws', async () => {
      const { headers, status, text, type } = await request(app$)
        .get('/_ws')
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

    it('● GET /api/users', async () => {
      const { headers, status, body } = await request(app$)
        .get('/api/users')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body.message).toStrictEqual(
        'Fetched all user details successfully',
      )
    })

    it.sequential('● POST /api/user', async () => {
      const { headers, status, body } = await request(app$)
        .post('/api/user')
        .send(testUser)
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
      expect(Object.keys(body.data)).toStrictEqual([
        'id',
        'name',
        'email',
        'phone',
        'password',
        'address',
        'isVerified',
        'role',
        'createdAt',
        'updatedAt',
      ])
    })

    it.sequential('● PUT /api/user:/:id', async () => {
      const { headers, status, body } = await request(app$)
        .put(`/api/user/${id}`)
        .send({
          ...testUser,
          address: 'Skolspåret 81, 533 18 LUNDSBRUNN, United States',
        })
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

    it.sequential('● PUT /api/user:/:throw', async () => {
      const { headers, status, body } = await request(app$)
        .put(`/api/user/${id}`)
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

  describe('⬢ Validate routing when DB error', () => {
    const id: string = string.uuid()

    afterEach(() => {
      vi.clearAllMocks()
    })

    it('● GET /api/users 500', async () => {
      vi.spyOn(db, 'select').mockRejectedValueOnce(new Error('Error'))
      const { headers, status } = await request(app$)
        .get('/api/users')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(500)
    })

    it('● GET /api/user 500', async () => {
      vi.spyOn(db, 'select').mockRejectedValueOnce(new Error('Error'))
      const { headers, status } = await request(app$)
        .get(`/api/user/${id}`)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(500)
    })

    it('● POST /api/user 500', async () => {
      vi.spyOn(db, 'insert').mockRejectedValueOnce(new Error('Error'))
      const { headers, status } = await request(app$)
        .post('/api/user/')
        .send(testUser)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(500)
    })

    it('● PUT /api/user/:id 500', async () => {
      vi.spyOn(db, 'update').mockRejectedValueOnce(new Error('Error'))
      const { headers, status } = await request(app$)
        .put(`/api/user/${id}`)
        .send({
          ...testUser,
          id,
        })
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(500)
    })

    it('● DELETE /api/user:/:id 500', async () => {
      vi.spyOn(db, 'delete').mockRejectedValueOnce(new Error('DB error'))
      vi.spyOn(resolvers.Query, 'getUser').mockRejectedValueOnce(testUser)
      vi.spyOn(resolvers.Mutation, 'deleteUser').mockRejectedValueOnce(
        new Error('DB error'),
      )
      const deleteUserResponse = await request(app$)
        .delete(`/api/user/${id}`)
        .set('Accept', 'application/json')
      expect(deleteUserResponse.headers['content-type']).toMatch(/json/)
      expect(deleteUserResponse.status).toEqual(500)
    })
  })
})
