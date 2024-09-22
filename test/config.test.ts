import type { IConfig } from '../src/config'
import { describe, expect, it } from 'vitest'
import { defineConfig } from '../src/config'

describe('⬢ Validate config', () => {
  const defaultConfig: IConfig = {
    host: '127.0.0.1',
    port: 8080,
    log_level: 3,
    services: ['db', 'redis'],
    ratelimit: 100,
    system: {
      platform: 'aix',
      runtime: 'bun',
    },
    graceful_delay: 0,
    sentry_dsn: 'fake_dsn',
    isHTTPs: false,
    duration: 0,
    enable_cache: false,
  }
  it('● should validated config', async () => {
    const config = defineConfig(defaultConfig)
    expect(config?.host).toStrictEqual('127.0.0.1')
    expect(config?.port).toStrictEqual(8080)
    expect(config?.log_level).toStrictEqual(3)
    expect([...new Set(config?.services)]).toStrictEqual(['db', 'redis'])
    expect(config?.ratelimit).toStrictEqual(100)
    expect(config?.ratelimit).toStrictEqual(100)
    expect(config?.sentry_dsn).toStrictEqual('fake_dsn')
    expect(config?.system?.platform).toStrictEqual('aix')
    expect(config?.system?.runtime).toStrictEqual('bun')
  })

  it('● should validated overwrite config value', async () => {
    const config = defineConfig({
      ...defaultConfig,
      port: 1000,
      ratelimit: 100,
      graceful_delay: 100,
      sentry_dsn: 'fake_updated_dsn',
    })
    expect(config?.host).toStrictEqual('127.0.0.1')
    expect(config?.port).toStrictEqual(1000)
    expect(config?.log_level).toStrictEqual(3)
    expect(config?.services).toStrictEqual(['db', 'redis'])
    expect(config?.ratelimit).toStrictEqual(100)
    expect(config?.graceful_delay).toStrictEqual(100)
    expect(config?.sentry_dsn).toStrictEqual('fake_updated_dsn')
    expect(config?.system?.platform).toStrictEqual('aix')
    expect(config?.system?.runtime).toStrictEqual('bun')
  })
})
