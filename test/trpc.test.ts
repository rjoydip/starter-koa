import { initTRPC } from '@trpc/server'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { getTestUser } from '../scripts/_seed'
import { createApplication } from '../src/app.ts'
import { tRPCRouter } from '../src/trpc'
import { API_PREFIX } from '../src/utils.ts'

describe('⬢ Validate tRPC', () => {
  let _id: string
  const t = initTRPC.context().create()
  const { createCallerFactory } = t
  const createCaller = createCallerFactory(tRPCRouter)
  const caller = createCaller({})

  describe('⬢ Validate routes through factory', () => {
    it('● should get response form ping', async () => {
      const r = await caller.ping()
      expect(r).toBeDefined()
    })

    it.sequential('● should get response form createUser', async () => {
      const r = await caller.createUser(getTestUser())
      if (r.id) {
        _id = String(r.id)
      }
      expect(r.id).toBeDefined()
    })

    it.sequential('● should get response form getUsers', async () => {
      const r = await caller.getUsers()
      expect(r).toBeDefined()
    })

    it.sequential('● should get response form getUser', async () => {
      const r = await caller.getUser(_id)
      expect(String(r.id)).toBe(String(_id))
    })

    it.sequential('● should get response form updateUser', async () => {
      const r = await caller.updateUser({
        id: _id,
        payload: {
          ...getTestUser(),
          address: 'Skolspåret 81, 533 18 LUNDSBRUNN, United States',
        },
      })
      expect(String(r.id)).toBe(String(_id))
    })

    it.sequential('● should get response form deleteUser', async () => {
      const r = await caller.deleteUser(_id)
      expect(String(r.id)).toBe(String(_id))
    })

    it.sequential('● should get response form getUser after delete', async () => {
      const r = await caller.getUser(_id)
      expect(r).toBeUndefined()
    })
  })

  describe('⬢ Validate routes through HTTP', () => {
    const app = createApplication()
    const app$ = app.callback()

    it('● should get response form ping', async () => {
      const { headers, status, body } = await request(app$)
        .get(`/${API_PREFIX}/trpc/ping`)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch('application/json')
      expect(status).toEqual(200)
      expect(body).toEqual({
        result: {
          data: 'Pong',
        },
      })
    })

    it('● should get response form getUsers', async () => {
      const { headers, status, body } = await request(app$)
        .get(`/${API_PREFIX}/trpc/getUsers`)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch('application/json')
      expect(status).toEqual(200)
      expect(body.result).toBeDefined()
    })

    it.skip('● should get response form createUser', async () => {
      const testUser = getTestUser()
      const { headers, status, body } = await request(app$)
        .get(`/${API_PREFIX}/trpc/createUser?input=${JSON.stringify(testUser)}`)
        .set('Accept', 'application/json')
      expect(headers['content-type']).toMatch('application/json')
      expect(status).toEqual(200)
      expect(body).toMatchObject({
        result: {
          data: testUser,
        },
      })
    })
  })
})
