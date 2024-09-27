import { describe, expect, it } from 'vitest'
import { dbDown, initDB } from '../src/db'
import resolvers from '../src/resolvers'

describe('⬢ Validate resolvers', () => {
  const query = resolvers.Query
  it('● should validate query index', async () => {
    const { index } = query
    expect(await index()).toStrictEqual({
      message: 'Welcome to Koa Starter',
    })
  })

  it('● should validate query status', async () => {
    const { status } = query
    expect(status()).toStrictEqual({
      data: { status: 'up' },
    })
  })

  it('● should validate query metrics', async () => {
    const { metrics } = query
    const $ = metrics()
    expect($).toBeDefined()
    expect($.data).toBeDefined()
    expect($.data.cpuUsage).toBeDefined()
    expect($.data.memoryUsage).toBeDefined()
    expect($.data.loadAverage).toBeDefined()
  })

  it('● should validate query health', async () => {
    const { health } = query
    await initDB()
    expect(await health()).toStrictEqual({
      data: {
        db: true,
        redis: false,
      },
    })
    await dbDown()
  })
})
