import { describe, expect, it } from 'vitest'
import { defineConfig } from '../src/config'

describe('⬢ Validate config', () => {
  it('● should validated config', async () => {
    const config = defineConfig({
      server: {
        host: 'xxxxx',
        port: 1111,
      },
      app: {
        env: {
          NODE_ENV: 'test',
        },
        log_level: 3,
        services: ['db'],
        ratelimit: 1111111,
      },
      system: {
        platform: 'aix',
        runtime: 'bun',
      },
    })
    expect(config?.server?.host).toStrictEqual('xxxxx')
    expect(config?.server?.port).toStrictEqual(1111)
    expect(config?.app?.env).toStrictEqual({ NODE_ENV: 'test' })
    expect(config?.app?.log_level).toStrictEqual(3)
    expect([...new Set(config?.app?.services)]).toStrictEqual(['db', 'redis'])
    expect(config?.app?.ratelimit).toStrictEqual(1111111)
    expect(config?.system?.platform).toStrictEqual('aix')
    expect(config?.system?.runtime).toStrictEqual('bun')
  })
  it('● should validated default config', async () => {
    const config = defineConfig()
    expect(config?.server?.host).toStrictEqual('localhost')
    expect(config?.server?.port).toStrictEqual(3000)
    expect(config?.app?.env).toStrictEqual({ NODE_ENV: 'test' })
    expect(config?.app?.log_level).toStrictEqual(3)
    expect(config?.app?.services).toStrictEqual(['db', 'redis'])
    expect(config?.app?.ratelimit).toStrictEqual(60000)
    expect(config?.system?.platform).toStrictEqual('aix')
    expect(config?.system?.runtime).toStrictEqual('bun')
  })

  it('● should validated overwrite config value', async () => {
    const config = defineConfig({
      server: {
        port: 1000,
      },
    })
    expect(config?.server?.host).toStrictEqual('localhost')
    expect(config?.server?.port).toStrictEqual(1000)
    expect(config?.app?.env).toStrictEqual({ NODE_ENV: 'test' })
    expect(config?.app?.log_level).toStrictEqual(3)
    expect(config?.app?.services).toStrictEqual(['db', 'redis'])
    expect(config?.app?.ratelimit).toStrictEqual(60000)
    expect(config?.system?.platform).toStrictEqual('aix')
    expect(config?.system?.runtime).toStrictEqual('bun')
  })
})
