import type { UserInput } from '../src/schema.ts'
import { faker } from '@faker-js/faker/locale/en'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createUser,
  db,
  deleteUser,
  getUser,
  getUsers,
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

  afterEach(() => {
    faker.seed()
  })

  it('● should check if the database is not up', async () => {
    vi.spyOn(db, 'execute').mockRejectedValueOnce(new Error('Error'))
    expect(await isDBUp()).toBeFalsy()
  })

  it('● should check if the database is up', async () => {
    expect(await isDBUp()).toBeTruthy()
  })

  it.sequential('● should insert and retrieve a user', async () => {
    const user$ = await createUser(testUser)
    expect(user$).toBeDefined()
    expect(user$?.name).toBe(testUser.name)

    if (user$?.id) {
      id = user$.id
      const fetchedUser = await getUser(user$.id)
      expect(fetchedUser).toBeDefined()
      expect(fetchedUser?.name).toBe(testUser.name)
      expect(fetchedUser?.email).toBe(testUser.email)
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
