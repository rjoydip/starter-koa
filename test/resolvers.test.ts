import type { User } from '../src/types'
import { faker } from '@faker-js/faker/locale/en'
import { afterEach, describe, expect, it } from 'vitest'
import resolvers from '../src/resolvers'

const {
  person,
  internet,
  phone,
  datatype,
  location,
  number,
} = faker

describe('⬢ Validate resolvers', () => {
  const query = resolvers.Query
  const mutation = resolvers.Mutation

  const testUser: User = {
    name: person.fullName(),
    email: internet.email(),
    phone: phone.number({ style: 'international' }),
    isVerifed: datatype.boolean(),
    password: internet.password(),
    address: `${location.streetAddress}, ${location.city}, ${location.state}, ${location.zipCode}, ${location.country}`,
  }

  afterEach(() => {
    faker.seed()
  })

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
      const $ = await getUser(null, { id: number.int({ min: 1, max: 10 }) })
      expect($).toBeUndefined()
    })

    it.sequential('● should validate mutation createUser', async () => {
      const { createUser } = mutation
      const $ = await createUser(null, { input: { ...testUser } })
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
            name: person.fullName(),
            email: internet.email(),
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
