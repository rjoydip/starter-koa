import type { Cache, DataTransformer, Events, StorageInputMemory, StorageInputRedis } from 'async-cache-dedupe'
import { createCache } from 'async-cache-dedupe'

export function setupCache(res: { entities: {
  name: string
  find: <T>(value: T) => T
}[] }, opts: {
  storage?: StorageInputRedis | StorageInputMemory
  ttl?: number | ((result: unknown) => number)
  transformer?: DataTransformer
  stale?: number | ((result: unknown) => number)
} & Events): Cache {
  const { entities } = res

  const cache = createCache(opts)
  for (const entity of Object.values(entities)) {
    const fnName = `${entity?.name}Find`
    const originalFn = entity?.find

    cache.define(fnName, {
      serialize(query) {
        return {
          ...query,
          ctx: undefined,
        }
      },
    }, async (query) => {
      const res = await originalFn.call(entity, query)
      return res
    })
  }

  return cache
}
