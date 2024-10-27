import type { UserInput } from '../src/schema.ts'
import { faker } from '@faker-js/faker/locale/en'
import { describe, expect, it, vi } from 'vitest'
import cache from '../src/cache.ts'
import {
  createUser,
  dbInterface,
  deleteUser,
  getUsers,
  isCacheUp,
  isDBUp,
} from '../src/db.ts'

const {
  person,
  internet,
  phone,
  datatype,
  location,
} = faker

describe('⬢ Validate db', () => {
  let id: string

  const testUser: UserInput = {
    name: person.fullName(),
    email: internet.email(),
    phone: phone.number({ style: 'international' }),
    isVerified: datatype.boolean(),
    password: internet.password(),
    address: `${location.streetAddress()}, ${location.city()}, ${location.state()}, ${location.zipCode()}, ${location.country()}`,
    role: 'admin',
  }

  it('● should check if the database connector', async () => {
    expect(dbInterface.dialect).toBe('postgresql')
  })

  it('● should check if the database is not up', async () => {
    const mockError = new Error('Database connection failed')
    vi.spyOn(dbInterface, 'exec').mockRejectedValueOnce(mockError)
    const result = await isDBUp()
    expect(result).toBe(false)
  })

  it('● should check if the cache is not up', async () => {
    vi.spyOn(cache, 'getItem').mockRejectedValueOnce(new Error('Error'))
    expect(await isCacheUp()).toBeFalsy()
  })

  it('● should check if the database is up', async () => {
    expect(await isDBUp()).toBeTruthy()
  })

  it('● should check if the cache is up', async () => {
    expect(await isCacheUp()).toBeTruthy()
  })

  describe('⬢ Validate db user', () => {
    it.sequential('● should insert and retrieve a user', async () => {
      const result = await createUser(testUser)
      expect(result).toBeDefined()
      expect(result?.name).toBe(testUser.name)
      expect(result?.email).toBe(testUser.email)
      if (result) {
        id = result.id
      }
    })

    it.sequential('● should fetch all users', async () => {
      const users = await getUsers()
      expect(users.length).toBeGreaterThan(0)
    })

    it.sequential('● should fetch all users multiple times', async () => {
      const users1 = await getUsers()
      const users2 = await getUsers()
      const users3 = await getUsers()
      expect(users1.length).toBeGreaterThan(0)
      expect(users2.length).toBeGreaterThan(0)
      expect(users3.length).toBeGreaterThan(0)
    })

    it.sequential('● should delete user', async () => {
      const deletedUser = await deleteUser(id)
      expect(deletedUser.id).toStrictEqual(id)
    })
  })
})
