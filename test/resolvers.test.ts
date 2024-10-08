import type { User } from '../src/types'
import { afterAll, describe, expect, it } from 'vitest'
import { dbDown } from '../src/db'
import resolvers from '../src/resolvers'

describe('⬢ Validate resolvers', () => {
  afterAll(async () => await dbDown())

  const query = resolvers.Query
  const mutation = resolvers.Mutation

  describe('⬢ Validate main resolvers', () => {
    it('● should validate query index', async () => {
      const { index } = query
      expect(await index()).toStrictEqual({
        message: 'Welcome to Koa Starter',
      })
    })

    it('● should validate query status', async () => {
      const { status } = query
      expect(status()).toStrictEqual({
        data: { status: 'up' },
      })
    })

    it('● should validate query metrics', async () => {
      const { metrics } = query
      const $ = metrics()
      expect($).toBeDefined()
      expect($.data).toBeDefined()
      expect($.data.cpuUsage).toBeDefined()
      expect($.data.memoryUsage).toBeDefined()
      expect($.data.loadAverage).toBeDefined()
    })

    it('● should validate query health', async () => {
      const { health } = query
      expect(await health()).toStrictEqual({
        data: {
          db: true,
          redis: false,
        },
      })
    })
  })

  describe('⬢ Validate user resolvers', () => {
    it.sequential('● should validate query getUsers', async () => {
      const { getUsers } = query
      const $ = await getUsers()
      expect($).toBeDefined()
      expect($.length).toBe(0)
    })

    it.sequential('● should validate query getUser', async () => {
      const { getUser } = query
      const $ = await getUser(null, { id: 1 })
      expect($).toBeUndefined()
    })

    it.sequential('● should validate mutation createUser', async () => {
      const { createUser } = mutation
      const $ = await createUser(null, { input: { name: 'John Doe', email: 'john@example.com', phone: '1234567890', address: '123 Main St', password: '12345' } })
      expect($).toBeDefined()
      expect($?.id).toBeDefined()
    })

    it.sequential('● should validate mutation updateUser', async () => {
      const { getUsers } = query
      const { updateUser } = mutation
      const users: User[] = await getUsers()
      if (users && users[0].id) {
        const $ = await updateUser(null, {
          id: users[0].id,
          input: {
            ...users[0],
            name: 'John Doe Edited',
            email: 'john.edit@example.com',
          },
        })
        expect($).toBeDefined()
      }
    })

    it.sequential('● should validate mutation deleteUser', async () => {
      const { getUsers } = query
      const { deleteUser } = mutation
      const users: User[] = await getUsers()
      if (users && users[0].id) {
        await deleteUser(null, {
          id: users[0].id,
        })
      }
    })
  })
})
