import type { IConfig } from '../src/config'
import { faker } from '@faker-js/faker/locale/en'
import { afterEach, describe, expect, it } from 'vitest'
import config from '../src/config'

const {
  internet,
  number,
  datatype,
} = faker

describe('⬢ Validate config', () => {
  afterEach(() => {
    faker.seed()
  })

  it('● should validated config', () => {
    const defaultConfig = config
    expect(defaultConfig?.port).toStrictEqual(8080)
    expect(defaultConfig?.log_level).toStrictEqual(3)
    expect(defaultConfig?.ratelimit).toStrictEqual(70000)
    expect(defaultConfig?.graceful_delay).toStrictEqual(500)
    expect(defaultConfig?.runtime).toStrictEqual('node')
    expect(defaultConfig?.monitor_dsn).toBeUndefined()
    expect(defaultConfig?.db_url).toBeDefined()
    expect(defaultConfig?.isHTTPs).toStrictEqual(false)
    expect(defaultConfig?.duration).toStrictEqual(6000)
  })

  it('● should validated overwrite config value', () => {
    const port = internet.port()
    const isHTTPs = datatype.boolean()
    const duration = number.int({ min: 1000, max: 6000 })
    const dns = internet.url()
    const db_url = internet.url()
    const number$ = number.int({ min: 100, max: 1000 })

    const overwriteConfig: IConfig = {
      ...config,
      port,
      graphql_port: port,
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
