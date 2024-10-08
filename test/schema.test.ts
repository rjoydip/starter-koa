import type { User } from '../src/types'
import { safeParse } from 'valibot'
import { describe, expect, it } from 'vitest'
import { users, UserSchema } from '../src/schema'

describe('⬢ Validate schema', () => {
  const playload: User = {
    id: 1,
    role: 'user',
    name: 'Benedicte Smans',
    email: 'BenedicteSmans@armyspy.com',
    password: '1234',
    isVerified: false,
    address: 'Skolspåret 81, 533 18  LUNDSBRUNN',
    phone: '+(46)0511-7158851',
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
