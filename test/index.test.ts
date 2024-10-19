import * as Sentry from '@sentry/node'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import config from '../src/config.ts'
import { main } from '../src/index.ts'
import * as utils from '../src/utils.ts'

vi.mock(import('@sentry/node'), () => ({
  init: vi.fn(),
}))

vi.mock(import('../src/config.ts'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    monitor_dsn: 'https://example.com/sentry',
  }
})

describe('⬢ Validate main', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('● should initialize Sentry with correct configuration when environemt is testing', async () => {
    vi.spyOn(utils, 'environment').mockReturnValue('testing')
    vi.spyOn(utils, 'isProd').mockReturnValue(false)

    await main()

    expect(Sentry.init).toHaveBeenCalledWith({
      dsn: config.monitor_dsn,
      environment: utils.environment(),
      enabled: utils.isProd(),
      integrations: utils.isProd() ? ['mockedIntegration'] : [],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    })
  })

  it('● should initialize Sentry with correct configuration when environemt is production', async () => {
    vi.spyOn(utils, 'environment').mockReturnValue('production')
    vi.spyOn(utils, 'isProd').mockReturnValue(true)

    await main()

    expect(Sentry.init).toHaveBeenCalledWith({
      dsn: config.monitor_dsn,
      environment: utils.environment(),
      enabled: utils.isProd(),
      integrations: utils.isProd() ? [expect.anything()] : [],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    })
  })
})
