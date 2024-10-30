import type { GraphQLSchemaWithContext } from 'graphql-yoga'
import { v4 as uuid } from '@lukeed/uuid/secure'
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { createSchema } from 'graphql-yoga'
import { z } from 'zod'
import { resolvers } from './resolvers.ts'
import typeDefs from './typedefs.ts'

/**
 * Represents the structure of the users table in the database.
 *
 * @type {Table}
 */
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

/**
 * Schema for inserting a new user into the users table.
 *
 * @type {InsertSchema}
 */
export const insertUserSchema = createInsertSchema(users, {
  id: schema => schema.id.uuid(),
  name: z.string().min(8),
}).omit({ id: true, createdAt: true, updatedAt: true })

/**
 * Schema for selecting user data from the users table.
 *
 * @type {SelectSchema}
 */
export const selectUserSchema = createSelectSchema(users, {
  name: z.string().min(8),
}).omit({ password: true })

/**
 * Represents a selected user.
 *
 * @export
 * @type {UserSelect}
 */
export type UserSelect = z.infer<typeof selectUserSchema>

/**
 * Represents input data for creating or updating a user.
 *
 * @export
 * @type {UserInput}
 */
export type UserInput = z.infer<typeof insertUserSchema>

/**
 * Parameters for paginated user retrieval.
 *
 * @export
 * @interface IUserParams
 */
export interface IUserParams {
  /**
   * The page number for pagination (optional).
   *
   * @type {number | undefined}
   */
  page?: number
  /**
   * The number of users per page for pagination (optional).
   *
   * @type {number | undefined}
   */
  pageSize?: number
}

/**
 * Creates and returns a GraphQL schema with context for the application.
 *
 * @export
 * @returns {GraphQLSchemaWithContext<any>} The GraphQL schema with resolvers and type definitions.
 */
export function graphqlSchema(): GraphQLSchemaWithContext<any> {
  return createSchema({
    typeDefs,
    resolvers,
  })
}
