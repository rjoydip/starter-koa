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
    expect(defaultConfig?.cache_url).toBeDefined()
    expect(defaultConfig?.cache_ttl).toBe(1)
    expect(defaultConfig?.cert_days).toBe(365)
  })

  it('● should validated overwrite config value', async () => {
    const port = internet.port()
    const isHTTPs = datatype.boolean()
    const duration = number.int({ min: 1000, max: 6000 })
    const dns = internet.url()
    const db_url = internet.url()
    const ratelimit = number.int({ min: 100, max: 1000 })
    const graceful_delay = number.int({ min: 100, max: 500 })
    const cache_ttl = number.int({ min: 10, max: 60 })
    const cert_days = number.int({ min: 1, max: 365 })

    const overwriteConfig: IConfig = {
      ...config,
      port,
      ratelimit,
      graceful_delay,
      monitor_dsn: dns,
      log_level: 3,
      isHTTPs,
      duration,
      runtime: 'bun',
      db_url,
      cache_ttl,
      cert_days,
    }

    expect(overwriteConfig?.port).toStrictEqual(port)
    expect(overwriteConfig?.log_level).toStrictEqual(3)
    expect(overwriteConfig?.ratelimit).toStrictEqual(ratelimit)
    expect(overwriteConfig?.graceful_delay).toStrictEqual(graceful_delay)
    expect(overwriteConfig?.db_url).toStrictEqual(db_url)
    expect(overwriteConfig?.runtime).toStrictEqual('bun')
    expect(overwriteConfig?.monitor_dsn).toStrictEqual(dns)
    expect(overwriteConfig?.isHTTPs).toStrictEqual(isHTTPs)
    expect(overwriteConfig?.duration).toStrictEqual(duration)
    expect(overwriteConfig?.cache_ttl).toStrictEqual(cache_ttl)
    expect(overwriteConfig?.cert_days).toStrictEqual(cert_days)
  })
})
