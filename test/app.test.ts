import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApplication } from '../src/app.ts'

const app = createApplication()
const app$ = app.callback()

describe('⬢ Validate app', () => {
  describe('⬢ Validate IP middleware', () => {
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
