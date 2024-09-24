import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import app from '../src/app'
import { dbDown, initDB, tablesDrop } from '../src/db'

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

  describe('⬢ Validate routing', () => {
    let _id: string

    it('● GET /users', async () => {
      const { headers, status, body } = await request(app.callback())
        .get('/users')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body.message).toStrictEqual('Fetched all user details successfully')
      expect(body.data.length).toBe(0)
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
