import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import { dbClose, dbDown, dbUP } from '../src/db'

describe('❯ Validate app', () => {
  let _id: string
  beforeAll(async () => {
    await dbUP()
  })

  afterAll(async () => {
    await dbDown()
    await dbClose()
  })

  it('● GET /', async () => {
    const { headers, status, body } = await request(app.callback())
      .get('/')
      .set('Accept', 'application/json')
    expect(headers['content-type']).toMatch(/json/)
    expect(status).toEqual(200)
    expect(body).toStrictEqual({
      message: 'Root',
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

  describe('❯ Validate user', () => {
    it.sequential('● POST /user', async () => {
      const validResponse = await request(app.callback())
        .post('/user')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          address: 'Test Address',
          phone: '+10000000000',
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
          email: 'test@test.com',
          address: 'Test Address',
          phone: '+10000000000',
        })
        .set('Accept', 'application/json')
      expect(invalidResponse.headers['content-type']).toMatch(/json/)
      expect(invalidResponse.status).toEqual(422)
      expect(invalidResponse.body.error.length).toBe(1)
      expect(invalidResponse.body.error[0].input).toStrictEqual('Test')
    })

    it.sequential('● GET /user:/:id', async () => {
      const getUserResponse = await request(app.callback())
        .get(`/user/${_id}`)
        .set('Accept', 'application/json')
      expect(getUserResponse.headers['content-type']).toMatch(/json/)
      expect(getUserResponse.status).toEqual(200)
      expect(getUserResponse.body.data).toBeDefined()
      expect(Object.keys(getUserResponse.body.data)).toStrictEqual(['_id', 'name', 'email', 'phone', 'address'])
    })

    it.sequential('● PUT /user:/:id', async () => {
      const putUserResponse = await request(app.callback())
        .put(`/user/${_id}`)
        .send({
          name: 'Test User',
          email: 'test.updated@test.com',
          address: 'Test Address',
          phone: '+10000000001',
        })
        .set('Accept', 'application/json')
      expect(putUserResponse.headers['content-type']).toMatch(/json/)
      expect(putUserResponse.status).toEqual(200)
      expect(putUserResponse.body.data).toBeDefined()
      expect(Object.keys(putUserResponse.body.data)).toStrictEqual(['_id', 'name', 'email', 'phone', 'address'])
      expect(putUserResponse.body.data.email).toStrictEqual('test.updated@test.com')
      expect(putUserResponse.body.data.phone).toStrictEqual('+10000000001')
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
  })
})

describe('❯ IP middleware', () => {
  it('● should allow access from whitelisted IP', async () => {
    const res = await request(app.callback())
      .get('/')
      .set('x-forwarded-for', '127.0.0.1')

    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual({
      message: 'Root',
      data: {},
      error: {},
    })
  })

  it('● should allow access from an IP not listed in blacklist or whitelist', async () => {
    const res = await request(app.callback())
      .get('/')
      .set('x-forwarded-for', '10.0.0.1')

    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual({
      message: 'Root',
      data: {},
      error: {},
    })
  })

  it.skip('● should block access from blacklisted IP', async () => {
    app.use((ctx, next) => {
      ctx.req.headers['x-forwarded-for'] = '192.168.0.5'
      return next()
    })
    const res = await request(app.callback())
      .get('/')

    expect(res.status).toBe(422)
  })

  it.skip('● should block access from blacklisted IP range', async () => {
    app.use((ctx, next) => {
      ctx.request.ip = '8.8.8.2'
      return next()
    })
    const res = await request(app.callback())
      .get('/')

    expect(res.status).toBe(422)
  })
})
