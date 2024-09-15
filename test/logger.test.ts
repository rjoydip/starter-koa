import consola from 'consola'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import logger from '../src/logger'

describe('❯ Validate logger', () => {
  const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => {})
  const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {})

  beforeAll(() => {
    consola.wrapAll()
  })

  beforeEach(() => {
    consola.mockTypes(() => vi.fn())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('● should call consola.info with correct message', () => {
    const message = 'This is an info message'
    logger.info(message)
    expect(infoSpy).toHaveBeenCalledWith(message)
  })

  it('● should call consola.error with correct error message', () => {
    const errorMessage = 'This is an error message'
    logger.error(errorMessage)
    expect(errorSpy).toHaveBeenCalledWith(errorMessage)
  })
})
