import { env } from 'node:process'
import { faker } from '@faker-js/faker/locale/en'
import consola from 'consola'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import logger from '../src/logger'
import { captureException } from '../src/utils'

describe('⬢ Validate logger', () => {
  let originalEnv: NodeJS.ProcessEnv
  const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => {})
  const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {})

  beforeEach(() => {
    originalEnv = { ...process.env }
    consola.mockTypes(() => vi.fn())
  })

  afterEach(() => {
    process.env = originalEnv
    vi.clearAllMocks()
  })

  it('● should call consola.info', () => {
    const message = faker.lorem.text()
    expect(() => logger.info(message)).not.throw()
    expect(infoSpy).toBeCalledTimes(1)
    expect(infoSpy).toHaveBeenCalledWith(message)
  })

  it('● should not call consola.error', () => {
    const errMsg = new Error(faker.lorem.text())
    expect(() => captureException(errMsg)).not.throw()
    expect(errorSpy).toBeCalledTimes(0)
  })

  it('● should call consola.error', () => {
    const errMsg = faker.lorem.text()
    env.NODE_ENV = 'production'
    expect(() => captureException(errMsg)).toThrowError()
    expect(errorSpy).toBeCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith(errMsg)
  })
})
