import { safeParse } from 'valibot'
import { describe, expect, it } from 'vitest'
import { UserSchema } from '../src/schema'

describe('❯ Validate schema', () => {
  const playload = {
    _id: 'x',
    name: 'test user',
    email: 'test@test.com',
    phone: '+1000000000',
    address: 'test address',
  }

  it('● should validated UserSchema for correct user details', async () => {
    const result = safeParse(UserSchema, playload)
    expect(result.success).toBeTruthy()
  })

  it('● should validated UserSchema for incorrect user public _id', async () => {
    const result = safeParse(UserSchema, { ...playload, _id: null })
    expect(result.success).toBeFalsy()
    expect(result.issues?.length).toBeGreaterThan(0)
    result.issues?.forEach((issue) => {
      expect(issue.message).toStrictEqual('Invalid type: Expected string but received null')
    })
  })

  it('● should validated UserSchema for incorrect user name', async () => {
    const result = safeParse(UserSchema, { ...playload, name: 'test' })
    expect(result.success).toBeFalsy()
    expect(result.issues?.length).toBeGreaterThan(0)
    result.issues?.forEach((issue) => {
      expect(issue.message).toStrictEqual('Invalid length: Expected >=8 but received 4')
    })
  })
})
