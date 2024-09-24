import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../src/app'

describe('⬢ Validate app', () => {
  describe('⬢ Validate main routes', () => {
    it('● GET /', async () => {
      const { headers, status, body } = await request(app.callback())
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

    it('● GET /metrics', async () => {
      const { headers, status, body } = await request(app.callback())
        .get('/metrics')
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch(/json/)
      expect(status).toEqual(200)
      expect(body.message).toStrictEqual('Metrics')
      expect(body.data).toBeDefined()
    })
  })

  describe('⬢ IP middleware', () => {
    it('● should allow access from whitelisted IP', async () => {
      const res = await request(app.callback())
        .get('/')
        .set('x-forwarded-for', '127.0.0.1')

      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual({
        message: 'Welcome to Koa Starter',
        statusCode: 200,
      })
    })

    it('● should allow access from an IP not listed in blacklist or whitelist', async () => {
      const res = await request(app.callback())
        .get('/')

      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual({
        message: 'Welcome to Koa Starter',
        statusCode: 200,
      })
    })

    it('● should block access from blacklisted IP range', async () => {
      app.proxy = true
      const res = await request(app.callback())
        .get('/')
        .set('x-forwarded-host', '192.168.0.5')
      expect(res.status).toBe(403)
    })

    it('● should block access from blacklisted IP', async () => {
      app.proxy = true
      const res = await request(app.callback())
        .get('/')
        .set('Host', '192.168.0.5')
      expect(res.status).toBe(403)
    })
  })
})
