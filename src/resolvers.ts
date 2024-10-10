import type { User, UserInput } from './types'
import { loadavg } from 'node:os'
import { cpuUsage, memoryUsage } from 'node:process'
import { createUser, deleteUser, getUser, getUsers, isDBUp, updateUser } from './db'

export default {
  Query: {
    index() {
      return {
        message: 'Welcome to Koa Starter',
      }
    },
    status() {
      return {
        data: { status: 'up' },
      }
    },
    metrics() {
      return {
        data: {
          memoryUsage: memoryUsage(),
          cpuUsage: cpuUsage(),
          loadAverage: loadavg(),
        },
      }
    },
    async health() {
      const db = await isDBUp()
      return {
        data: {
          db,
          redis: false,
        },
      }
    },
    async getUser(_: unknown, { id }: { id: number }) {
      return await getUser(id)
    },
    async getUsers(): Promise<User[]> {
      return await getUsers()
    },
  },
  Mutation: {
    async createUser(_: unknown, { input }: { input: UserInput }) {
      return await createUser(input)
    },
    async updateUser(_: unknown, { id, input }: { id: number, input: UserInput }) {
      return await updateUser(id, input)
    },
    async deleteUser(_: unknown, { id }: { id: number }) {
      return await deleteUser(id)
    },
  },
}
