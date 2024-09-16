import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../src/app'

describe('⬢ Validate app', () => {
  describe('⬢ IP middleware', () => {
    it('● should allow access from whitelisted IP', async () => {
      const res = await request(app.callback())
        .get('/')
        .set('x-forwarded-for', '127.0.0.1')

      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual({
        message: 'Index',
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
        message: 'Index',
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
})
