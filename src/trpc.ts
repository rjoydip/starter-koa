import { initTRPC } from '@trpc/server'
import { createHTTPHandler } from '@trpc/server/adapters/standalone'
import { z } from 'zod'
import resolvers from './resolvers'
import { insertUserSchema } from './schema'

const { Mutation, Query } = resolvers

const t = initTRPC.create()
const { procedure, router } = t

export const tRPCRouter = router({
  getUsers: procedure
    .input(z.undefined())
    .query(async () => {
      return await Query.getUsers()
    }),
  getUser: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await Query.getUser(null, { id: input.id })
    }),
  createUser: procedure
    .input(z.object({ data: insertUserSchema }))
    .mutation(async ({ input }) => {
      return await Mutation.createUser(null, { input: input.data })
    }),
  updateUser: procedure
    .input(z.object({ id: z.string(), data: insertUserSchema }))
    .mutation(async ({ input }) => {
      return await Mutation.updateUser(null, { id: input.id, input: input.data })
    }),
  deleteUser: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await Mutation.deleteUser(null, { id: input.id })
    }),
})
export type TRPCRouter = typeof tRPCRouter

export const defindTRPCHandler = createHTTPHandler({
  router: tRPCRouter,
})
