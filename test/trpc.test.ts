import { initTRPC } from '@trpc/server'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { getTestUser } from '../scripts/_seed'
import { createApplication } from '../src/app'
import { tRPCRouter } from '../src/trpc'
import { API_PREFIX } from '../src/utils'

const app = createApplication()
const app$ = app.callback()

describe('⬢ Validate tRPC', () => {
  let _id: string

  describe('⬢ Validate routes', () => {
    it.sequential('● should get response form getUsers', async () => {
      const t = initTRPC.context().create()
      const { createCallerFactory } = t
      const createCaller = createCallerFactory(tRPCRouter)
      const caller = createCaller({})
      const r = await caller.getUsers()
      expect(r).toBeDefined()
    })

    it.sequential('● should get response form createUser', async () => {
      const t = initTRPC.context().create()
      const { createCallerFactory } = t
      const createCaller = createCallerFactory(tRPCRouter)
      const caller = createCaller({})
      const r = await caller.createUser(getTestUser())
      if (r.id) {
        _id = String(r.id)
      }
      expect(r.id).toBeDefined()
    })

    it.sequential('● should get response form getUser', async () => {
      const t = initTRPC.context().create()
      const { createCallerFactory } = t
      const createCaller = createCallerFactory(tRPCRouter)
      const caller = createCaller({})
      const r = await caller.getUser(_id)
      expect(String(r.id)).toBe(String(_id))
    })

    it.sequential('● should get response form updateUser', async () => {
      const t = initTRPC.context().create()
      const { createCallerFactory } = t
      const createCaller = createCallerFactory(tRPCRouter)
      const caller = createCaller({})
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
      const t = initTRPC.context().create()
      const { createCallerFactory } = t
      const createCaller = createCallerFactory(tRPCRouter)
      const caller = createCaller({})
      const r = await caller.deleteUser(_id)
      expect(String(r.id)).toBe(String(_id))
    })

    it.sequential('● should get response form getUser after delete', async () => {
      const t = initTRPC.context().create()
      const { createCallerFactory } = t
      const createCaller = createCallerFactory(tRPCRouter)
      const caller = createCaller({})
      const r = await caller.getUser(_id)
      expect(r).toBeUndefined()
    })
  })

  describe('⬢ Validate handler', () => {
    it('● should get response form welcome', async () => {
      const { status, body } = await request(app$)
        .get(`/${API_PREFIX}/trpc/welcome`)
        .set('Accept', 'application/json')
      expect(status).toEqual(200)
      expect(body.result.data).toEqual('Welcome to Koa Starter')
    })
  })
})
