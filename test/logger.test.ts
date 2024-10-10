import { faker } from '@faker-js/faker/locale/en'
import consola from 'consola'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import logger from '../src/logger'
import { captureException } from '../src/utils'

describe('⬢ Validate logger', () => {
  let originalEnv: NodeJS.ProcessEnv
  const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => {})
  const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {})

  beforeAll(() => {
    consola.wrapAll()
  })

  beforeEach(() => {
    consola.mockTypes(() => vi.fn())
    originalEnv = { ...process.env }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.clearAllMocks()
  })

  it('● should call consola.info with correct message', () => {
    const message = faker.lorem.text()
    expect(() => logger.info(message)).not.throw()
    expect(infoSpy).toBeCalledTimes(1)
    expect(infoSpy).toHaveBeenCalledWith(message)
  })

  it('● should call consola.error with correct error message', () => {
    const errMsg = faker.lorem.text()
    process.env.NODE_ENV = 'production'
    expect(() => captureException(errMsg)).toThrowError()

    process.env.NODE_ENV = 'development'
    expect(() => captureException(errMsg)).not.throw()
    expect(errorSpy).toBeCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith(errMsg)
  })
})
