import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { getTestUser, getTestUsers } from '../scripts/_seed.ts'
import cache from '../src/cache.ts'
import {
  createUser,
  db,
  dbInterface,
  deleteUser,
  getUsers,
  isCacheUp,
  isDBUp,
} from '../src/db.ts'
import { users } from '../src/schema.ts'

describe('⬢ Validate db', () => {
  let id: string

  beforeEach(() => {
    vi.clearAllMocks()
  })

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
      const testUser = getTestUser()
      const result = await createUser(testUser)
      expect(result).toBeDefined()
      expect(result?.name).toBe(testUser.name)
      expect(result?.email).toBe(testUser.email)
      if (result) {
        id = result.id
      }
    })

    it.sequential('● should fetch all users', async () => {
      const users = await Promise.allSettled([
        await getUsers(),
        await getUsers(),
        await getUsers(),
      ])
      expect(users.length).toBeGreaterThan(0)
    })

    it.sequential('● should delete user', async () => {
      const deletedUser = await deleteUser(id)
      expect(deletedUser.id).toStrictEqual(id)
    })
  })

  describe('⬢ Validate get users', () => {
    const mockData = getTestUsers(2)

    beforeAll(async () => {
      await db.delete(users)
      await db.insert(users).values(mockData)
    })

    afterEach(async () => {
      await cache.clear()
    })

    afterAll(async () => {
      await db.delete(users)
    })

    it('● should retrieve users from the cache if available', async () => {
      cache.get = vi.fn().mockResolvedValue(mockData)
      const users = await getUsers({ page: 1, pageSize: 2 })
      expect(cache.get).toHaveBeenCalledWith('users_page_1_size_2')
      expect(users.map(i => i.email)).toEqual(mockData.map(i => i.email))
    })

    it('● should retrieve users from the database if not in cache and cache the result', async () => {
      cache.get = vi.fn().mockResolvedValue(null)
      cache.set = vi.fn()
      const users = await getUsers({ page: 1, pageSize: 2 })
      expect(cache.get).toHaveBeenCalledWith('users_page_1_size_2')
      expect(users.map(i => i.email)).toEqual(mockData.map(i => i.email))
    })

    it('● should return paginated results based on page and pageSize', async () => {
      const users = await getUsers({ page: 1, pageSize: 2 })
      expect(users.map(i => i.email)).toEqual(mockData.slice(0, 2).map(i => i.email))
    })
  })
})
