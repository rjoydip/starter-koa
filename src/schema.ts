import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
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
