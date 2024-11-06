import { initTRPC } from '@trpc/server'
import { createHTTPHandler } from '@trpc/server/adapters/standalone'
import { z } from 'zod'
import { resolvers } from './resolvers'
import { insertUserSchema } from './schema'

/**
 * Initializes the TRPC instance for creating routers and procedures.
 *
 * @type {TRPC}
 */
const t = initTRPC.create()
const { procedure, router } = t

/**
 * Defines the TRPC router for handling user-related operations.
 *
 * @type {TRPCRouter}
 */
export const tRPCRouter = router({
  /**
   * Check status.
   *
   * @returns {string} - Return Pong.
   */
  ping: procedure.input(z.null()).query(() => 'Pong'),
  /**
   * Retrieves a list of users.
   *
   * @returns {Promise<User[]>} A promise that resolves to an array of users.
   */
  getUsers: procedure
    .input(z.null())
    .query(async () => {
      return await resolvers.Query.getUsers()
    }),

  /**
   * Retrieves a user by their ID.
   *
   * @param {string} input The ID of the user to retrieve.
   * @returns {Promise<User | null>} A promise that resolves to the user object or null if not found.
   */
  getUser: procedure
    .input(z.string())
    .query(async ({ input }) => {
      return await resolvers.Query.getUser(null, { id: input })
    }),

  /**
   * Creates a new user.
   *
   * @param {InsertUserInput} input The input data for creating the user.
   * @returns {Promise<User>} A promise that resolves to the created user object.
   */
  createUser: procedure
    .input(insertUserSchema)
    .mutation(async ({ input }) => {
      return await resolvers.Mutation.createUser(null, { input })
    }),

  /**
   * Updates an existing user.
   *
   * @param {{ id: string; payload: InsertUserInput }} input The ID of the user and the updated data.
   * @returns {Promise<User>} A promise that resolves to the updated user object.
   */
  updateUser: procedure
    .input(z.object({ id: z.string(), payload: insertUserSchema }))
    .mutation(async ({ input }) => {
      return await resolvers.Mutation.updateUser(null, { id: input.id, input: input.payload })
    }),

  /**
   * Deletes a user by their ID.
   *
   * @param {string} input The ID of the user to delete.
   * @returns {Promise<boolean>} A promise that resolves to true if the user was deleted successfully.
   */
  deleteUser: procedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return await resolvers.Mutation.deleteUser(null, { id: input })
    }),
})

/**
 * Type definition for the TRPC router.
 *
 * @export
 * @typedef {TRPCRouter}
 */
export type TRPCRouter = typeof tRPCRouter

/**
 * Creates an HTTP handler for the TRPC router.
 *
 * @returns {HTTPHandler} The created HTTP handler.
 */
export const defineTRPCHandler = createHTTPHandler({
  router: tRPCRouter,
  /* v8 ignore next 2 */
  createContext() {
    return {}
  },
})
