import type { GraphQLSchemaWithContext } from 'graphql-yoga'
import { v4 as uuid } from '@lukeed/uuid/secure'
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createSchema } from 'graphql-yoga'
import { z } from 'zod'
import { resolvers } from './resolvers.ts'
import typeDefs from './typedefs.ts'

export const users = pgTable('users', {
  id: text('id').$defaultFn(() => uuid()).primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull().unique(),
  password: text('password').notNull(),
  address: text('address').notNull(),
  isVerified: boolean('is_verified').default(false),
  role: text('role', { enum: ['admin', 'user'] }).notNull().default('user'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const insertUserSchema = createInsertSchema(users, {
  id: schema => schema.id.uuid(),
  name: z.string().min(8),
}).omit({ id: true, createdAt: true, updatedAt: true })
export const selectUserSchema = createSelectSchema(users, {
  name: z.string().min(8),
}).omit({ password: true })

/**
 * @export
 * @typedef {UserSelect}
 */
export type UserSelect = z.infer<typeof selectUserSchema>
/**
 * @export
 * @typedef {UserInput}
 */
export type UserInput = z.infer<typeof insertUserSchema>

export function graphqlSchema(): GraphQLSchemaWithContext<any> {
  return createSchema({
    typeDefs,
    resolvers,
  })
}
