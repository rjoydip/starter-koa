import type { UserInput, UserSelect } from './schema.ts'
import type { IMetaData, IMetrics } from './types.ts'
import { loadavg } from 'node:os'
import { memoryUsage } from 'node:process'
import { cache } from './cache.ts'
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  isDBUp,
  updateUser,
} from './db.ts'

export default {
  Query: {
    _metrics(): {
      data: IMetrics
    } {
      return {
        data: {
          memoryUsage: memoryUsage(),
          loadAverage: loadavg(),
        },
      }
    },
    async health() {
      const _isDBUp = await isDBUp()
      const _isCacheUp = !!cache.namespace
      return {
        data: {
          db: _isDBUp,
          cache: _isCacheUp,
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
    async getUsers(): Promise<UserSelect[]> {
      return await getUsers()
    },
    async getUser(_: unknown, { id }: { id: string }): Promise<UserSelect> {
      return await getUser(id)
    },
  },
  Mutation: {
    async createUser(_: unknown, { input }: { input: UserInput }): Promise<UserSelect> {
      return await createUser(input)
    },
    async updateUser(
      _: unknown,
      { id, input }: { id: string, input: UserInput },
    ): Promise<UserSelect> {
      return await updateUser(id, input)
    },
    async deleteUser(_: unknown, { id }: { id: string }): Promise<{ id: string }> {
      return await deleteUser(id)
    },
  },
}
