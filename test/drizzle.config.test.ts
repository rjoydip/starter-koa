import { describe, expect, it } from 'vitest'
import drizzleConfig from '../drizzle.config.ts'

describe('⬢ Validate drizzle config', () => {
  it('● should valid the config value', () => {
    expect(drizzleConfig.schema).toStrictEqual('./src/schema.ts')
    expect(drizzleConfig.out).toStrictEqual('./drizzle')
    expect(drizzleConfig.dialect).toStrictEqual('postgresql')
    expect(drizzleConfig.dbCredentials.url).toContain('postgresql://')
  })

  it('● should valid the config invalue', () => {
    expect(drizzleConfig.schema).not.toStrictEqual('src/schema.ts')
    expect(drizzleConfig.out).not.toStrictEqual('./drizzle/invalid')
    expect(drizzleConfig.dialect).not.toStrictEqual('sql')
    expect(drizzleConfig.dbCredentials.url).toContain('postgresql://')
  })
})
