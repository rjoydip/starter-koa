import getPort from 'get-port'
import pify from 'pify'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getSelectedTestUser, getTestUser, getUUID } from '../scripts/_seed.ts'
import { createApplication } from '../src/app.ts'
import * as db from '../src/db.ts'
import { resolvers } from '../src/resolvers.ts'
import { createGraphQLServer } from '../src/server.ts'
import { API_PREFIX } from '../src/utils.ts'

const app = createApplication()
const app$ = app.callback()

describe('⬢ Validate routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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
          cache: true,
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
        'name',
        'license',
        'version',
      ])
    })

    it('● GET /openapi.json', async () => {
      const { headers, status, body } = await request(app$)
        .get('/openapi.json')
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

    it(`● GET /${API_PREFIX}/graphql`, async () => {
      const port = await getPort()
      const graphqlServer = createGraphQLServer()
      await pify(graphqlServer.listen(port))
      const { status } = await request(`http://127.0.0.1:${port}`)
        .get(`/${API_PREFIX}/graphql`)
      expect(status).toEqual(200)
      await pify(graphqlServer.close())
    })
  })

  describe('⬢ Validate user routes', () => {
    let id: string
    it(`● GET /${API_PREFIX}/users`, async () => {
      const { headers, status, body } = await request(app$)
        .get(`/${API_PREFIX}/users`)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body.message).toStrictEqual(
        'Fetched all user details successfully',
      )
    })

    it.sequential(`● POST /${API_PREFIX}/user`, async () => {
      const { headers, status, body } = await request(app$)
        .post(`/${API_PREFIX}/user`)
        .send(getTestUser())
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body.message).toStrictEqual('User details stored successfully')
      expect(body.data).toBeDefined()
      id = body.data.id
    })

    it.sequential(`● GET /${API_PREFIX}/user:/:id`, async () => {
      const { headers, status, body } = await request(app$)
        .get(`/${API_PREFIX}/user/${id}`)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body.data).toBeDefined()
      expect(Object.keys(body.data)).toStrictEqual([
        'id',
        'name',
        'email',
        'phone',
        'address',
        'is_verified',
        'role',
        'created_at',
        'updated_at',
      ])
    })

    it.sequential(`● PUT /${API_PREFIX}/user:/:id`, async () => {
      const { headers, status, body } = await request(app$)
        .put(`/${API_PREFIX}/user/${id}`)
        .send({
          ...getTestUser(),
          address: 'Skolspåret 81, 533 18 LUNDSBRUNN, United States',
        })
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body.message).toStrictEqual('User details updated successfully')
      expect(body.data).toBeDefined()
    })

    it.sequential(`● PATCH /${API_PREFIX}/user:/:id`, async () => {
      const { headers, status, body } = await request(app$)
        .patch(`/${API_PREFIX}/user/${id}`)
        .send({
          isVerified: false,
        })
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body.message).toStrictEqual('User details updated successfully')
      expect(body.data.isVerified).toBeFalsy()
    })

    it.sequential(`● DELETE /${API_PREFIX}/user:/:id`, async () => {
      const { headers, status, body } = await request(app$)
        .delete(`/${API_PREFIX}/user/${id}`)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body.message).toStrictEqual('User deleted successfully')
      expect(body.data).toBeDefined()
    })

    it.sequential(`● DELETE /${API_PREFIX}/user:/:id status 422`, async () => {
      const { headers, status } = await request(app$)
        .delete(`/${API_PREFIX}/user/${id}`)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(422)
    })

    it.sequential(`● PUT /${API_PREFIX}/user:/:throw`, async () => {
      const { headers, status, body } = await request(app$)
        .put(`/${API_PREFIX}/user/${id}`)
        .send({
          ...getTestUser(),
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

    it.sequential(`● GET /${API_PREFIX}/user/:deleted-user`, async () => {
      const { headers, status, body } = await request(app$)
        .get(`/${API_PREFIX}/user/${id}`)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(422)
      expect(body).toStrictEqual({
        statusCode: 422,
        message: 'User Invalid',
      })
    })

    it.sequential(`● DELETE /${API_PREFIX}/user:/:wrong-id`, async () => {
      const deleteUserResponse = await request(app$)
        .delete(`/${API_PREFIX}/user/${getUUID()}`)
        .set('Accept', 'application/json')
      expect(deleteUserResponse.headers['content-type']).toMatch(/json/)
      expect(deleteUserResponse.status).toEqual(422)
    })
  })

  describe('⬢ Validate routing when got error', () => {
    let id: string
    it.sequential(`● GET /${API_PREFIX}/users 500`, async () => {
      vi.spyOn(db, 'getUsers').mockRejectedValueOnce(new Error('Error'))
      const { headers, status } = await request(app$)
        .get(`/${API_PREFIX}/users`)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(500)
    })

    it.sequential(`● GET /${API_PREFIX}/user 500`, async () => {
      vi.spyOn(db, 'getUser').mockRejectedValueOnce(new Error('Error'))
      const { headers, status } = await request(app$)
        .get(`/${API_PREFIX}/user/${id}`)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(500)
    })

    it.sequential(`● POST /${API_PREFIX}/user 500`, async () => {
      vi.spyOn(db, 'createUser').mockRejectedValueOnce(new Error('Error'))
      const { headers, status } = await request(app$)
        .post(`/${API_PREFIX}/user/`)
        .send(getTestUser())
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(500)
    })

    it.sequential(`● PUT /${API_PREFIX}/user/:id 500`, async () => {
      vi.spyOn(db, 'updateUser').mockRejectedValueOnce(new Error('Error'))
      vi.spyOn(resolvers.Query, 'getUser').mockRejectedValueOnce(getTestUser())
      const { headers, status } = await request(app$)
        .put(`/${API_PREFIX}/user/${id}`)
        .send({
          ...getTestUser(),
          id,
        })
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(500)
    })

    it.sequential(`● PATCH /${API_PREFIX}/user/:id 500`, async () => {
      vi.spyOn(db, 'updateUser').mockRejectedValueOnce(new Error('Error'))
      vi.spyOn(resolvers.Query, 'getUser').mockRejectedValueOnce(getTestUser())
      const { headers, status } = await request(app$)
        .patch(`/${API_PREFIX}/user/${id}`)
        .send({
          isVerified: false,
        })
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(500)
    })

    it.sequential(`● PUT /${API_PREFIX}/user/:id 500 when mutated`, async () => {
      vi.spyOn(resolvers.Query, 'getUser').mockResolvedValueOnce(getSelectedTestUser())
      vi.spyOn(resolvers.Mutation, 'updateUser').mockRejectedValueOnce(new Error('Error'))
      const { headers, status } = await request(app$)
        .put(`/${API_PREFIX}/user/${id}`)
        .send({
          ...getTestUser(),
          id,
        })
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(500)
    })

    it.sequential(`● PATCH /${API_PREFIX}/user/:id 500 when mutated`, async () => {
      vi.spyOn(resolvers.Query, 'getUser').mockResolvedValueOnce(getSelectedTestUser())
      vi.spyOn(resolvers.Mutation, 'updateUser').mockRejectedValueOnce(new Error('Error'))
      const { headers, status } = await request(app$)
        .patch(`/${API_PREFIX}/user/${id}`)
        .send({
          isVerified: false,
        })
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(500)
    })

    it.sequential(`● DELETE /${API_PREFIX}/user/:id 500 when getting mutation`, async () => {
      vi.spyOn(resolvers.Query, 'getUser').mockResolvedValueOnce(getSelectedTestUser())
      vi.spyOn(resolvers.Mutation, 'deleteUser').mockRejectedValueOnce(new Error('Error'))
      const { headers, status } = await request(app$)
        .delete(`/${API_PREFIX}/user/${id}`)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(500)
    })

    it.sequential(`● DELETE /${API_PREFIX}/user:/:id 500`, async () => {
      vi.spyOn(db, 'deleteUser').mockRejectedValueOnce(new Error('DB error'))
      vi.spyOn(resolvers.Query, 'getUser').mockRejectedValueOnce(getTestUser())
      vi.spyOn(resolvers.Mutation, 'deleteUser').mockRejectedValueOnce(
        new Error('DB error'),
      )
      const deleteUserResponse = await request(app$)
        .delete(`/${API_PREFIX}/user/${id}`)
        .set('Accept', 'application/json')
      expect(deleteUserResponse.headers['content-type']).toMatch(/json/)
      expect(deleteUserResponse.status).toEqual(500)
    })
  })
})
