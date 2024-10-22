import type { UserSelect } from '../src/schema'
import { Server } from 'node:http'
import { faker } from '@faker-js/faker/locale/en'
import { initTRPC } from '@trpc/server'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cache } from '../src/cache'
import { defindTRPCHandler, tRPCRouter } from '../src/trpc'

const {
  person,
  internet,
  phone,
  datatype,
  location,
} = faker

describe('⬢ Validate tRPC', () => {
  let _id: string

  const testUser: UserSelect = {
    name: person.fullName(),
    email: internet.email(),
    phone: phone.number({ style: 'international' }),
    isVerified: datatype.boolean(),
    password: internet.password(),
    address: `${location.streetAddress()}, ${location.city()}, ${location.state()}, ${location.zipCode()}, ${location.country()}`,
    role: 'admin',
  }

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
      const r = await caller.createUser(testUser)
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
      expect(r.id).toBe(Number(_id))
    })

    it.sequential('● should get response form updateUser', async () => {
      const t = initTRPC.context().create()
      const { createCallerFactory } = t
      const createCaller = createCallerFactory(tRPCRouter)
      const caller = createCaller({})
      const r = await caller.updateUser({
        id: _id,
        payload: {
          ...testUser,
          address: 'Skolspåret 81, 533 18 LUNDSBRUNN, United States',
        },
      })
      expect(r.id).toBe(Number(_id))
    })

    it.sequential('● should get response form deleteUser', async () => {
      const t = initTRPC.context().create()
      const { createCallerFactory } = t
      const createCaller = createCallerFactory(tRPCRouter)
      const caller = createCaller({})
      const r = await caller.deleteUser(_id)
      expect(r.id).toBe(Number(_id))
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
    let server: Server
    let url: string

    beforeAll(() => {
      cache.opts.ttl = 0
      server = new Server((req, res) => {
        if (req.url!.startsWith('/trpc')) {
          req.url = req.url!.replace('/trpc', '')
          return defindTRPCHandler(req, res)
        }
      })
      server.listen(0)
      const port = (server.address() as any).port as number
      url = `http://127.0.0.1:${port}`
    })

    afterAll(() => {
      server.close()
    })

    it('● should get response form ping', async () => {
      const res = await fetch(`${url}/trpc/welcome`, { method: 'GET' })
      const { result } = await res.json()
      expect(res.status).toBe(200)
      expect(result.data).toEqual('Welcome to Koa Starter')
    })

    it.skip('● should get response form getUsers', async () => {
      const res = await fetch(`${url}/trpc/users`, { method: 'GET' })
      const { result } = await res.json()
      expect(res.status).toBe(200)
      expect(result.data).toEqual([])
    })

    it.skip('● should get response form createUser', async () => {
      const res = await fetch(`${url}/trpc/user`, { method: 'POST', body: JSON.stringify(testUser) })
      const { result } = await res.json()
      expect(res.status).toBe(200)
      expect(result).toBeDefined()
    })
  })
})
