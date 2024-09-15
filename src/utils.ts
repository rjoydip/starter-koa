import type Router from 'koa-router'
import type { IRegisteredRoutes } from './types'

// Function to get all registered routes
export function getRegisteredRoutes(router: Router<any>): IRegisteredRoutes[] {
  return router.stack.map((layer) => {
    return {
      method: layer.methods,
      path: layer.path,
      regexp: layer.regexp,
    }
  })
}
