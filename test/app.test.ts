import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../src/app'

describe('⬢ Validate app', () => {
  describe('⬢ IP middleware', () => {
    describe('⬢ Validate whitelist', () => {
      it('● should allow access from whitelisted IP', async () => {
        const res = await request(app.callback())
          .get('/')
          .set('x-forwarded-for', '127.0.0.1')

        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual({
          message: 'Index',
          data: {},
          error: {},
          status: 'success',
          status_code: 200,
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
          status: 'success',
          status_code: 200,
        })
      })
    })

    describe('⬢ Validate blacklist', () => {
      it.skip('● should block access from blacklisted IP', async () => {
        app.proxy = true
        app.use((ctx, next) => {
          ctx.req.headers['x-forwarded-for'] = '192.168.0.5'
          ctx.req.headers.host = '192.168.0.5'
          return next()
        })
        const res = await request.agent(app.callback())
          .host('192.168.0.5')
          .get('/')
        expect(res.status).toBe(403)
      })

      it.skip('● should block access from blacklisted IP range', async () => {
        app.proxy = true
        app.use((ctx, next) => {
          ctx.request.ip = '192.168.0.5'
          return next()
        })
        const res = await request.agent(app.callback())
          .host('192.168.0.5')
          .get('/')
        expect(res.status).toBe(403)
        expect(res.text).toBe('Forbidden!!!')
      })
    })
  })
})
