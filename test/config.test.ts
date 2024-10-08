import { describe, expect, it } from 'vitest'
import config from '../src/config'

describe('⬢ Validate config', () => {
  it('● should validated config', async () => {
    const defaultConfig = config
    expect(defaultConfig?.host).toStrictEqual('127.0.0.1')
    expect(defaultConfig?.port).toStrictEqual(8080)
    expect(defaultConfig?.log_level).toStrictEqual(3)
    expect(defaultConfig?.ratelimit).toStrictEqual(70000)
    expect(defaultConfig?.runtime).toStrictEqual('node')
    expect(defaultConfig?.monitor_dsn).toBeUndefined()
    expect(defaultConfig?.auth_secret).toBeUndefined()
    expect(defaultConfig?.db_url).toBeDefined()
    expect(defaultConfig?.github_client_id).toBeUndefined()
    expect(defaultConfig?.github_client_secrt).toBeUndefined()
  })

  it('● should validated overwrite config value', async () => {
    const overwriteConfig = {
      ...config,
      port: 1000,
      graphql_port: 1001,
      ratelimit: 100,
      graceful_delay: 100,
      monitor_dsn: 'fake_updated_dsn',
      host: '127.0.0.1',
      log_level: 3,
      isHTTPs: false,
      duration: 0,
      runtime: 'bun',
      auth_secret: 'fake_auth_secret',
      github_client_id: 'fake_github_client_id',
      github_client_secrt: 'fake_github_client_secrt',
      db_url: 'fake_db_url',
    }
    expect(overwriteConfig?.host).toStrictEqual('127.0.0.1')
    expect(overwriteConfig?.port).toStrictEqual(1000)
    expect(overwriteConfig?.log_level).toStrictEqual(3)
    expect(overwriteConfig?.ratelimit).toStrictEqual(100)
    expect(overwriteConfig?.graceful_delay).toStrictEqual(100)
    expect(overwriteConfig?.db_url).toStrictEqual('fake_db_url')
    expect(overwriteConfig?.runtime).toStrictEqual('bun')
    expect(overwriteConfig?.monitor_dsn).toStrictEqual('fake_updated_dsn')
    expect(overwriteConfig?.auth_secret).toStrictEqual('fake_auth_secret')
    expect(overwriteConfig?.github_client_id).toStrictEqual('fake_github_client_id')
    expect(overwriteConfig?.github_client_secrt).toStrictEqual('fake_github_client_secrt')
  })
})
