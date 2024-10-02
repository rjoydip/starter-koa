import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../src/app'

describe('⬢ Validate app', () => {
  const app$ = app.callback()

  describe('⬢ Validate main routes', () => {
    it('● GET /invalid', async () => {
      const { headers, status, body } = await request(app$)
        .get('/invalid')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch('text/plain')
      expect(status).toEqual(404)
      expect(body).toEqual({})
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

  describe('⬢ IP middleware', () => {
    it('● should allow access from whitelisted IP', async () => {
      const res = await request(app$)
        .get('/')
        .set('x-forwarded-for', '127.0.0.1')

      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual({
        message: 'Welcome to Koa Starter',
        statusCode: 200,
      })
    })

    it('● should allow access from an IP not listed in blacklist or whitelist', async () => {
      const res = await request(app$)
        .get('/')

      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual({
        message: 'Welcome to Koa Starter',
        statusCode: 200,
      })
    })

    it('● should block access from blacklisted IP range', async () => {
      app.proxy = true
      const res = await request(app$)
        .get('/')
        .set('x-forwarded-host', '192.168.0.5')
      expect(res.status).toBe(403)
    })

    it('● should block access from blacklisted IP', async () => {
      app.proxy = true
      const res = await request(app$)
        .get('/')
        .set('Host', '192.168.0.5')
      expect(res.status).toBe(403)
    })
  })
})
