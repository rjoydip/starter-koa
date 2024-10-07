import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-valibot'
import { minLength, pipe, string } from 'valibot'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull().unique(),
  address: text('address').notNull(),
  role: text('role', { enum: ['admin', 'user'] }).notNull().default('user'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const UserSchema = createSelectSchema(users, {
  name: () => pipe(string(), minLength(8)),
})
