import type { IMetaData, User, UserInput } from './types'
import { loadavg } from 'node:os'
import { memoryUsage } from 'node:process'
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  isDBUp,
  updateUser,
} from './db'

export default {
  Query: {
    _metrics() {
      return {
        data: {
          memoryUsage: memoryUsage(),
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
    async _meta() {
      const { description, license, name, version }: IMetaData = await import('../package.json')

      return {
        data: {
          description,
          name,
          license,
          version,
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
    async updateUser(
      _: unknown,
      { id, input }: { id: number, input: UserInput },
    ) {
      return await updateUser(id, input)
    },
    async deleteUser(_: unknown, { id }: { id: number }) {
      return await deleteUser(id)
    },
  },
}
