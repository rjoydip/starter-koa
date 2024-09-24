import type { User } from '../src/types'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { dbDown, getUser, getUsers, initDB, isDBUp, setUser } from '../src/db'

const user: User = {
  _id: '',
  name: 'John Doe',
  email: 'johndoe@example.com',
  phone: '1234567890',
  address: '123 Main St',
}

describe('⬢ Validate db', () => {
  beforeAll(async () => {
    await initDB()
  })

  afterAll(async () => {
    await dbDown()
  })

  it('● should check if the database is up', async () => {
    expect(await isDBUp()).toBeTruthy()
  })

  it('● should insert and retrieve a user', async () => {
    const usr = await setUser(user)
    expect(usr).toBeDefined()
    expect(usr?.name).toBe(user.name)

    if (usr?._id) {
      const fetchedUser = await getUser(usr._id)
      expect(fetchedUser).toBeDefined()
      expect(fetchedUser?.name).toBe(user.name)
      expect(fetchedUser?.email).toBe(user.email)
    }
  })

  it('● should fetch all users', async () => {
    const users = await getUsers()
    expect(users.length).toBeGreaterThan(0)
    expect(users[0].name).toBe(user.name)
  })
})
