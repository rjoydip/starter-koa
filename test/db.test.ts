import type { User } from '../src/types'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { dbClose, dbDown, dbUP, getUser, getUsers, isDBUp, setUser } from '../src/db'

const user: User = {
  _id: '',
  name: 'John Doe',
  email: 'johndoe@example.com',
  phone: '1234567890',
  address: '123 Main St',
}

describe('❯ Validate db', () => {
  beforeAll(async () => {
    await dbUP()
  })

  afterAll(async () => {
    await dbDown()
    await dbClose()
  })

  it('● should check if the database is up', async () => {
    const result = await isDBUp()
    expect(result).toBeDefined()
  })

  it('● should insert and retrieve a user', async () => {
    const insertedUser = await setUser(user)
    expect(insertedUser).toBeDefined()
    expect(insertedUser?.name).toBe(user.name)

    if (insertedUser) {
      const fetchedUser = await getUser(insertedUser._id)
      expect(fetchedUser).toBeDefined()
      expect(fetchedUser.name).toBe(user.name)
      expect(fetchedUser.email).toBe(user.email)
    }
  })

  it('● should fetch all users', async () => {
    const users = await getUsers()
    expect(users.length).toBeGreaterThan(0)
    expect(users[0].name).toBe(user.name)
  })
})
