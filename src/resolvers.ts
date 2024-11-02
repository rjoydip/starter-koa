import type { IUserParams, UserInput, UserSelect } from './schema.ts'
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from './db.ts'

/**
 * GraphQL resolvers for the application, including query and mutation functions for user operations.
 */
export const resolvers = {
  Query: {
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
