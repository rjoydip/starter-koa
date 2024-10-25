import type { IConfig } from '../src/config.ts'
import { faker } from '@faker-js/faker/locale/en'
import { describe, expect, it } from 'vitest'
import config from '../src/config.ts'

const {
  internet,
  number,
  datatype,
} = faker

describe('⬢ Validate config', () => {
  it('● should validated default config', () => {
    const defaultConfig = config
    expect(defaultConfig?.port).toBeDefined()
    expect(Number(defaultConfig?.log_level)).toBeDefined()
    expect(defaultConfig?.ratelimit).toBeDefined()
    expect(defaultConfig?.graceful_delay).toBeDefined()
    expect(defaultConfig?.runtime).toBeDefined()
    expect(defaultConfig?.monitor_dsn).toBeDefined()
    expect(defaultConfig?.db_url).toBeDefined()
    expect(defaultConfig?.isHTTPs).toBeDefined()
    expect(defaultConfig?.duration).toBeDefined()
  })

  it('● should validated overwrite config value', async () => {
    const port = internet.port()
    const isHTTPs = datatype.boolean()
    const duration = number.int({ min: 1000, max: 6000 })
    const dns = internet.url()
    const db_url = internet.url()
    const number$ = number.int({ min: 100, max: 1000 })

    const overwriteConfig: IConfig = {
      ...config,
      port,
      ratelimit: number$,
      graceful_delay: number$,
      monitor_dsn: dns,
      log_level: 3,
      isHTTPs,
      duration,
      runtime: 'bun',
      db_url,
    }

    expect(overwriteConfig?.port).toStrictEqual(port)
    expect(overwriteConfig?.log_level).toStrictEqual(3)
    expect(overwriteConfig?.ratelimit).toStrictEqual(number$)
    expect(overwriteConfig?.graceful_delay).toStrictEqual(number$)
    expect(overwriteConfig?.db_url).toStrictEqual(db_url)
    expect(overwriteConfig?.runtime).toStrictEqual('bun')
    expect(overwriteConfig?.monitor_dsn).toStrictEqual(dns)
    expect(overwriteConfig?.isHTTPs).toStrictEqual(isHTTPs)
    expect(overwriteConfig?.duration).toStrictEqual(duration)
  })
})
