import type {
  Mock,
} from 'vitest'
import * as Sentry from '@sentry/node'
import getPort from 'get-port'
import {
  afterEach,
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

describe('⬢ Validate main', () => {
  beforeEach(async () => {
    const port = await getPort()
    vi.spyOn(config, 'port', 'get').mockReturnValue(port)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('● should validate main function not throw error', () => {
    expect(async () => {
      await main()
    }).not.toThrowError()
  })

  it('● should initialize Sentry with correct configuration when environemt is testing', async () => {
    vi.spyOn(utils, 'environment').mockReturnValue('testing')
    vi.spyOn(utils, 'isProd').mockReturnValue(false)
    vi.spyOn(config, 'isHTTPs', 'get').mockReturnValue(false)

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
    vi.spyOn(config, 'isHTTPs', 'get').mockReturnValue(true)

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

  it('● should capture an error if Sentry initialization fails', () => {
    const errorMessage = 'Failed to initialize Sentry'
    ;(Sentry.init as Mock).mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const captureExceptionSpy = vi.spyOn(utils, 'captureException')

    // Call the function that creates the server
    main()

    // Assert that the captureException was called with the correct error message
    expect(captureExceptionSpy).toHaveBeenCalledWith(`Error starting server: Error: ${errorMessage}`)
  })
})
