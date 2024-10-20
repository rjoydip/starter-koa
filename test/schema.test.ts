import type { UserInput } from '../src/schema.ts'
import { faker } from '@faker-js/faker/locale/en'
import { describe, expect, it } from 'vitest'
import { insertUserSchema, users } from '../src/schema.ts'

const {
  person,
  internet,
  phone,
  datatype,
  location,
  string,
} = faker

describe('⬢ Validate schema', () => {
  const playload: UserInput = {
    id: string.uuid(),
    role: 'user',
    isVerified: datatype.boolean(),
    name: person.fullName(),
    email: internet.email(),
    phone: phone.number({ style: 'international' }),
    password: internet.password(),
    address:
      `${location.streetAddress}, ${location.city}, ${location.state}, ${location.zipCode}, ${location.country}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('● should validated users table', () => {
    expect(users).toBeDefined()
  })

  it('● should validated UserSchema for correct user details', () => {
    const result = insertUserSchema.safeParse(playload)
    expect(result.success).toBeTruthy()
    expect(result.error).toBeUndefined()
  })

  it('● should validated UserSchema for incorrect user public id', () => {
    const result = insertUserSchema.safeParse({ ...playload, id: null })
    expect(result.success).toBeFalsy()
    expect(result.error?.issues.length).toBeGreaterThan(0)
  })

  it('● should validated UserSchema for incorrect user name', () => {
    const result = insertUserSchema.safeParse({ ...playload, name: 'test' })
    expect(result.success).toBeFalsy()
    result.error?.issues.forEach((issue) => {
      expect(issue.message).toStrictEqual(
        'String must contain at least 8 character(s)',
      )
    })
  })
})
