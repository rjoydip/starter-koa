import { safeParse } from 'valibot'
import { describe, expect, it } from 'vitest'
import { schema, UserSchema } from '../src/schema'

describe('⬢ Validate schema', () => {
  const playload = {
    name: 'Benedicte Smans',
    email: 'BenedicteSmans@armyspy.com',
    address: 'Skolspåret 81, 533 18  LUNDSBRUNN',
    phone: '+(46)0511-7158851',
  }

  it('● should validated UserSchema for correct user details', () => {
    const result = safeParse(UserSchema, playload)
    expect(result.success).toBeTruthy()
  })

  it('● should validated UserSchema for incorrect user public _id', () => {
    const result = safeParse(UserSchema, { ...playload, _id: null })
    expect(result.success).toBeTruthy()
    expect(result.issues?.length).toBeUndefined()
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

describe('⬢ Validate graphql schema', () => {
  it('● should validated main schema', () => {
    const query = schema.getQueryType()
    const queryField = query?.getFields()
    expect(schema).toBeDefined()
    expect(query?.name).toStrictEqual('Query')
    expect(queryField).toBeDefined()
  })
})
