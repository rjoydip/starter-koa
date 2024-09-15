import { describe, expect, it } from 'vitest'
import { router } from '../src/app'
import { getRegisteredRoutes } from '../src/utils'

describe('❯ Validate utils', () => {
  it('● should validated regestered routes', async () => {
    const registeredRoutes = ['/', '/status', '/health', '/users', '/user/:id', '/user']
    const routes = getRegisteredRoutes(router)
    const paths = routes.map(i => i.path)
    expect([...new Set(paths)]).toStrictEqual(registeredRoutes)
  })

  it('● should validated invalid regestered routes', async () => {
    const registeredRoutes = ['/', '/health', '/users', '/user/:id', '/user']
    const routes = getRegisteredRoutes(router)
    const paths = routes.map(i => i.path)
    expect([...new Set(paths)]).not.equal(registeredRoutes)
  })
})
