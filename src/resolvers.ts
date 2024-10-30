import type { IUserParams, UserInput, UserSelect } from './schema.ts'
import type { IMetaData, IMetrics } from './types.ts'
import { loadavg } from 'node:os'
import { memoryUsage } from 'node:process'
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  isCacheUp,
  isDBUp,
  updateUser,
} from './db.ts'

/**
 * GraphQL resolvers for the application, including query and mutation functions for user operations.
 */
export const resolvers = {
  Query: {
    /**
     * Provides system metrics such as memory usage and load average.
     *
     * @returns {{ data: IMetrics }} System metrics data.
     */
    _metrics(): { data: IMetrics } {
      return {
        data: {
          memoryUsage: memoryUsage(),
          loadAverage: loadavg(),
        },
      }
    },

    /**
     * Checks the health status of the database and cache.
     *
     * @returns {Promise<{ data: { db: boolean; cache: boolean } }>} Health status of the DB and cache.
     */
    async health(): Promise<{ data: { db: boolean, cache: boolean } }> {
      const dbStatus = await isDBUp()
      const cacheStatus = await isCacheUp()
      return {
        data: {
          db: dbStatus,
          cache: cacheStatus,
        },
      }
    },

    /**
     * Fetches application metadata including name, license, and version from package.json.
     *
     * @returns {Promise<{ data: { name: string; license: string; version: string } }>} Application metadata.
     */
    async _meta(): Promise<{ data: { name: string, license: string, version: string } }> {
      const { license, name, version }: IMetaData = await import('../package.json')
      return {
        data: {
          name,
          license,
          version,
        },
      }
    },

    /**
     * Retrieves a list of users based on optional filter parameters.
     *
     * @param {IUserParams} [params] Optional parameters for filtering users.
     * @returns {Promise<UserSelect[]>} List of users matching the provided parameters.
     */
    async getUsers(params?: IUserParams): Promise<UserSelect[]> {
      return await getUsers(params)
    },

    /**
     * Fetches a specific user by ID.
     *
     * @param {unknown} _ Unused.
     * @param {object} params The parameters object.
     * @param {string} params.id The ID of the user to fetch.
     * @returns {Promise<UserSelect>} The user matching the provided ID.
     */
    async getUser(_: unknown, { id }: { id: string }): Promise<UserSelect> {
      return await getUser(id)
    },
  },

  Mutation: {
    /**
     * Creates a new user with the provided input data.
     *
     * @param {unknown} _ Unused.
     * @param {object} params The parameters object.
     * @param {UserInput} params.input The input data for the new user.
     * @returns {Promise<UserSelect>} The newly created user.
     */
    async createUser(_: unknown, { input }: { input: UserInput }): Promise<UserSelect> {
      return await createUser(input)
    },

    /**
     * Updates an existing user by ID with the provided input data.
     *
     * @param {unknown} _ Unused.
     * @param {object} params The parameters object.
     * @param {string} params.id The ID of the user to update.
     * @param {UserInput} params.input The updated data for the user.
     * @returns {Promise<UserSelect>} The updated user.
     */
    async updateUser(_: unknown, { id, input }: { id: string, input: UserInput }): Promise<UserSelect> {
      return await updateUser(id, input)
    },

    /**
     * Deletes a user by ID.
     *
     * @param {unknown} _ Unused.
     * @param {object} params The parameters object.
     * @param {string} params.id The ID of the user to delete.
     * @returns {Promise<{ id: string }>} The ID of the deleted user.
     */
    async deleteUser(_: unknown, { id }: { id: string }): Promise<{ id: string }> {
      return await deleteUser(id)
    },
  },
}
