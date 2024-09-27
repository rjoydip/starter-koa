import { loadavg } from 'node:os'
import { cpuUsage, memoryUsage } from 'node:process'
import { isDBUp } from './db'

export default {
  Query: {
    index: () => {
      return {
        message: 'Welcome to Koa Starter',
      }
    },
    status: () => {
      return {
        data: { status: 'up' },
      }
    },
    metrics: () => {
      return {
        data: {
          memoryUsage: memoryUsage(),
          cpuUsage: cpuUsage(),
          loadAverage: loadavg(),
        },
      }
    },
    health: async () => {
      const db = await isDBUp()
      return {
        data: {
          db,
          redis: false,
        },
      }
    },
  },
}
