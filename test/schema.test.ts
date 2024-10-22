import type { UserInput, UserSelect } from '../src/schema.ts'
import { faker } from '@faker-js/faker/locale/en'
import { describe, expect, it } from 'vitest'
import { insertUserSchema, selectUserSchema, users } from '../src/schema.ts'

const {
  person,
  internet,
  phone,
  datatype,
  location,
  string,
  date,
} = faker

describe('⬢ Validate schema', () => {
  const inputPlayload: UserInput = {
    role: 'user',
    isVerified: datatype.boolean(),
    name: person.fullName(),
    email: internet.email(),
    phone: phone.number({ style: 'international' }),
    password: internet.password(),
    address:
      `${location.streetAddress}, ${location.city}, ${location.state}, ${location.zipCode}, ${location.country}`,
  }

  const selectPlayload: UserSelect = {
    id: string.uuid(),
    role: 'user',
    isVerified: datatype.boolean(),
    name: person.fullName(),
    email: internet.email(),
    phone: phone.number({ style: 'international' }),
    address:
      `${location.streetAddress}, ${location.city}, ${location.state}, ${location.zipCode}, ${location.country}`,
    createdAt: date.recent(),
    updatedAt: date.recent(),
  }

  it('● should validated users schema', () => {
    expect(users).toBeDefined()
  })

  describe('⬢ Validate insertUserSchema', () => {
    it('● should validated for correct user details', () => {
      const result = insertUserSchema.safeParse(inputPlayload)
      expect(result.success).toBeTruthy()
      expect(result.error).toBeUndefined()
    })

    it('● should validated for incorrect user name', () => {
      const result = insertUserSchema.safeParse({ ...inputPlayload, name: 'test' })
      expect(result.success).toBeFalsy()
      result.error?.issues.forEach((issue) => {
        expect(issue.message).toStrictEqual(
          'String must contain at least 8 character(s)',
        )
      })
    })
  })

  describe('⬢ Validate selectUserSchema', () => {
    it('● should validated for correct user details', () => {
      const result = selectUserSchema.safeParse({ ...selectPlayload })
      expect(result.success).toBeTruthy()
      expect(result.error).toBeUndefined()
    })

    it('● should validated for incorrect user public id', () => {
      const result = selectUserSchema.safeParse({ ...selectPlayload, id: null })
      expect(result.success).toBeFalsy()
      expect(result.error?.issues.length).toBeGreaterThan(0)
    })

    it('● should validated for incorrect user name', () => {
      const result = selectUserSchema.safeParse({ ...selectPlayload, name: 'test' })
      expect(result.success).toBeFalsy()
      result.error?.issues.forEach((issue) => {
        expect(issue.message).toStrictEqual(
          'String must contain at least 8 character(s)',
        )
      })
    })
  })
})
