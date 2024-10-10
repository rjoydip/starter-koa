import type { User } from '../src/types'
import { faker } from '@faker-js/faker/locale/en'
import { safeParse } from 'valibot'
import { describe, expect, it } from 'vitest'
import { users, UserSchema } from '../src/schema'

const {
  person,
  internet,
  phone,
  datatype,
  location,
  number,
} = faker

describe('⬢ Validate schema', () => {
  const playload: User = {
    id: number.int({ min: 1, max: 10 }),
    role: 'user',
    isVerified: datatype.boolean(),
    name: person.fullName(),
    email: internet.email(),
    phone: phone.number({ style: 'international' }),
    isVerifed: datatype.boolean(),
    password: internet.password(),
    address: `${location.streetAddress}, ${location.city}, ${location.state}, ${location.zipCode}, ${location.country}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('● should validated users table', () => {
    expect(users).toBeDefined()
  })

  it('● should validated UserSchema for correct user details', () => {
    const result = safeParse(UserSchema, playload)
    expect(result.success).toBeTruthy()
    expect(result.issues).toBeUndefined()
  })

  it('● should validated UserSchema for incorrect user public id', () => {
    const result = safeParse(UserSchema, { ...playload, id: null })
    expect(result.success).toBeFalsy()
    expect(result.issues?.length).toBeGreaterThan(0)
  })

  it('● should validated UserSchema for incorrect user name', () => {
    const result = safeParse(UserSchema, { ...playload, name: 'test' })
    expect(result.success).toBeFalsy()
    expect(result.issues?.length).toBeGreaterThan(0)
    result.issues?.forEach((issue) => {
      expect(issue.message).toStrictEqual('Invalid length: Expected >=8 but received 4')
    })
  })
})
