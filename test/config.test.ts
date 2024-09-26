import type { IConfig } from '../src/config'
import { describe, expect, it } from 'vitest'
import { defineConfig } from '../src/config'

describe('⬢ Validate config', () => {
  const defaultConfig: IConfig = {
    host: '127.0.0.1',
    port: 8080,
    graphql_port: 8081,
    log_level: 3,
    services: ['db', 'redis'],
    ratelimit: 100,
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
    expect(config?.graphql_port).toStrictEqual(8081)
    expect(config?.log_level).toStrictEqual(3)
    expect([...new Set(config?.services)]).toStrictEqual(['db', 'redis'])
    expect(config?.ratelimit).toStrictEqual(100)
    expect(config?.ratelimit).toStrictEqual(100)
    expect(config?.sentry_dsn).toStrictEqual('fake_dsn')
  })

  it('● should validated overwrite config value', async () => {
    const config = defineConfig({
      ...defaultConfig,
      port: 1000,
      graphql_port: 1001,
      ratelimit: 100,
      graceful_delay: 100,
      sentry_dsn: 'fake_updated_dsn',
    })
    expect(config?.host).toStrictEqual('127.0.0.1')
    expect(config?.port).toStrictEqual(1000)
    expect(config?.graphql_port).toStrictEqual(1001)
    expect(config?.log_level).toStrictEqual(3)
    expect(config?.services).toStrictEqual(['db', 'redis'])
    expect(config?.ratelimit).toStrictEqual(100)
    expect(config?.graceful_delay).toStrictEqual(100)
    expect(config?.sentry_dsn).toStrictEqual('fake_updated_dsn')
  })
})
