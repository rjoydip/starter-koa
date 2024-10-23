import { initTRPC } from '@trpc/server'
import { createHTTPHandler } from '@trpc/server/adapters/standalone'
import { z } from 'zod'
import resolvers from './resolvers'
import { insertUserSchema } from './schema'

const { Mutation, Query } = resolvers

const t = initTRPC.create()
const { procedure, router } = t

export const tRPCRouter = router({
  welcome: procedure
    .meta({ openapi: { method: 'GET', path: '/welcome' } })
    .input(z.void())
    .output(z.literal('Welcome to Koa Starter'))
    .query(() => 'Welcome to Koa Starter' as const),
  getUsers: procedure
    .meta({ openapi: { method: 'GET', path: '/users' } })
    .query(async () => {
      return await Query.getUsers()
    }),
  getUser: procedure
    .input(z.string())
    .query(async ({ input }) => {
      return await Query.getUser(null, { id: input })
    }),
  createUser: procedure
    .meta({ openapi: { method: 'POST', path: '/user' } })
    .input(insertUserSchema)
    .mutation(async ({ input }) => {
      return await Mutation.createUser(null, { input })
    }),
  updateUser: procedure
    .input(z.object({ id: z.string(), payload: insertUserSchema }))
    .mutation(async ({ input }) => {
      return await Mutation.updateUser(null, { id: input.id, input: input.payload })
    }),
  deleteUser: procedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return await Mutation.deleteUser(null, { id: input })
    }),
})
export type TRPCRouter = typeof tRPCRouter

export const defindTRPCHandler = createHTTPHandler({
  router: tRPCRouter,
  createContext() {
    return {}
  },
})
