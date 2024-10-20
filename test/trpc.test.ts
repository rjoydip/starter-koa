import type { UserInput } from '../src/schema'
import { faker } from '@faker-js/faker/locale/en'
import { initTRPC } from '@trpc/server'
import { describe, expect, it } from 'vitest'
import { tRPCRouter } from '../src/trpc'

const {
  person,
  internet,
  phone,
  datatype,
  location,
} = faker

describe('⬢ Validate tRPC', () => {
  let _id: string
  const testUser: UserInput = {
    name: person.fullName(),
    email: internet.email(),
    phone: phone.number({ style: 'international' }),
    isVerified: datatype.boolean(),
    password: internet.password(),
    address: `${location.streetAddress()}, ${location.city()}, ${location.state()}, ${location.zipCode()}, ${location.country()}`,
    role: 'admin',
  }

  it.sequential('● should getUsers', async () => {
    const t = initTRPC.context().create()
    const { createCallerFactory } = t
    const createCaller = createCallerFactory(tRPCRouter)
    const caller = createCaller({})
    const r = await caller.getUsers()
    expect(r).toBeDefined()
  })

  it.sequential('● should createUser', async () => {
    const t = initTRPC.context().create()
    const { createCallerFactory } = t
    const createCaller = createCallerFactory(tRPCRouter)
    const caller = createCaller({})
    const r = await caller.createUser({ data: testUser })
    if (r.id) {
      _id = String(r.id)
    }
    expect(r).toBeDefined()
  })

  it.sequential('● should getUser', async () => {
    const t = initTRPC.context().create()
    const { createCallerFactory } = t
    const createCaller = createCallerFactory(tRPCRouter)
    const caller = createCaller({})
    const r = await caller.getUser({ id: _id })
    expect(r).toBeDefined()
  })

  it.sequential('● should updateUser', async () => {
    const t = initTRPC.context().create()
    const { createCallerFactory } = t
    const createCaller = createCallerFactory(tRPCRouter)
    const caller = createCaller({})
    const r = await caller.updateUser({
      id: _id,
      data: {
        ...testUser,
        address: 'Skolspåret 81, 533 18 LUNDSBRUNN, United States',
      },
    })
    expect(r).toBeDefined()
  })

  it.sequential('● should deleteUser', async () => {
    const t = initTRPC.context().create()
    const { createCallerFactory } = t
    const createCaller = createCallerFactory(tRPCRouter)
    const caller = createCaller({})
    const r = await caller.deleteUser({ id: _id })
    expect(r).toBeUndefined()
  })

  it.sequential('● should getUser after delete', async () => {
    const t = initTRPC.context().create()
    const { createCallerFactory } = t
    const createCaller = createCallerFactory(tRPCRouter)
    const caller = createCaller({})
    const r = await caller.getUser({ id: _id })
    expect(r).toBeUndefined()
  })
})
