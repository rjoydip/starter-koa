import { describe, expect, it } from 'vitest'
import { getRouter, validateRouter } from '../src/routers'

describe('❯ Validate routes', () => {
  it('● should validated invalid route name', async () => {
    const invalidRouter = getRouter('invalid')
    expect(invalidRouter).toBeNull()
    expect(() => validateRouter(invalidRouter)).toThrowError('Router is empty')
  })
  it('● should validated root routes', async () => {
    const rootRouter = getRouter('Root')
    expect(validateRouter(rootRouter)).toBeTruthy()
  })
  it('● should validated status routes', async () => {
    const statusRouter = getRouter('Status')
    expect(validateRouter(statusRouter)).toBeTruthy()
  })
  it('● should validated health routes', async () => {
    const healthRouter = getRouter('Health')
    expect(validateRouter(healthRouter)).toBeTruthy()
  })
  it('● should validated get users routes', async () => {
    const usersRouter = getRouter('GetUsers')
    expect(validateRouter(usersRouter)).toBeTruthy()
  })
  it('● should validated get user routes', async () => {
    const userRouter = getRouter('GetUser')
    expect(validateRouter(userRouter)).toBeTruthy()
  })
  it('● should validated post user routes', async () => {
    const userRouter = getRouter('PostUser')
    expect(validateRouter(userRouter)).toBeTruthy()
  })
})
