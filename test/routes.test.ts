import { describe, expect, it } from 'vitest'
import { getRouter, validateRouter } from '../src/routers'

function validate(name: string) {
  return validateRouter(getRouter(name))
}

describe('❯ Validate routes', () => {
  it('● should validated invalid route name', async () => {
    const invalidRouter = getRouter('invalid')
    expect(invalidRouter).toBeNull()
    expect(() => validateRouter(invalidRouter)).toThrowError('Router is empty')
  })
  it('● should validated / root routes', async () => {
    expect(validate('Root')).toBeTruthy()
  })
  it('● should validated /status routes', async () => {
    expect(validate('Status')).toBeTruthy()
  })
  it('● should validated /health routes', async () => {
    expect(validate('Health')).toBeTruthy()
  })

  describe('❯ Validate user routes', () => {
    it('● should validated /GET users routes', async () => {
      expect(validate('GetUsers')).toBeTruthy()
    })
    it('● should validated /GET user routes', async () => {
      expect(validate('GetUser')).toBeTruthy()
    })
    it('● should validated /POST user routes', async () => {
      expect(validate('PostUser')).toBeTruthy()
    })
    it('● should validated /PUT user routes', async () => {
      expect(validate('PutUser')).toBeTruthy()
    })
    it('● should validated /PDELETEUT user routes', async () => {
      expect(validate('DeleteUser')).toBeTruthy()
    })
  })

  it('● should validated validateRouter name', async () => {
    expect(() => validateRouter({
      name: '',
      path: '/',
      method: 'GET',
      middleware: [],
      handler: () => Promise.resolve(),
    })).toThrow('Router name must be a non-empty string')

    expect(() => validateRouter({
      name: 'xxxx',
      path: '',
      method: 'GET',
      middleware: [],
      handler: () => Promise.resolve(),
    })).toThrow('Router path must be a non-empty string')

    expect(() => validateRouter({
      name: 'xxxx',
      path: '/',
      method: 'FOO',
      middleware: [],
      handler: () => Promise.resolve(),
    })).toThrow('Router method must be a valid HTTP method')

    expect(() => validateRouter({
      name: 'xxxx',
      path: '/',
      method: 'GET',
      middleware: null as any,
      handler: () => Promise.resolve(),
    })).toThrow('Router middleware must be an array')

    expect(() => validateRouter({
      name: 'xxxx',
      path: '/',
      method: 'GET',
      middleware: [],
      handler: null as any,
    })).toThrow('Router handler must be a function')
  })
})
