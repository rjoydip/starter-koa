import type { User } from '../src/types'
import { describe, expect, it } from 'vitest'
import { createUser, deleteUser, getUser, getUsers, isDBUp } from '../src/db'

const user: User = {
  name: 'John Doe',
  email: 'johndoe@example.com',
  phone: '1234567890',
  isVerifed: false,
  password: '12345',
  address: '123 Main St',
}

describe('⬢ Validate db', () => {
  let id: number

  it('● should check if the database is up', async () => {
    expect(await isDBUp()).toBeTruthy()
  })

  it.sequential('● should fetch users', async () => {
    const users = await getUsers()
    expect(users[0]).toBeUndefined()
  })

  it.sequential('● should insert and retrieve a user', async () => {
    const usr = await createUser(user)
    expect(usr).toBeDefined()
    expect(usr?.name).toBe(user.name)

    if (usr?.id) {
      id = usr.id
      const fetchedUser = await getUser(usr.id)
      expect(fetchedUser).toBeDefined()
      expect(fetchedUser?.name).toBe(user.name)
      expect(fetchedUser?.email).toBe(user.email)
    }
  })

  it.sequential('● should fetch all users', async () => {
    const users = await getUsers()
    expect(users.length).toBeGreaterThan(0)
    expect(users[0].name).toBe(user.name)
  })

  it.sequential('● should delete user', async () => {
    const deletedUser = await deleteUser(id)
    expect(deletedUser.id).toStrictEqual(id)
  })
})
