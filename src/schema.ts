import { boolean, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-valibot'
import { minLength, pipe, string } from 'valibot'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
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

export const UserSchema = createInsertSchema(users, {
  name: () => pipe(string(), minLength(8)),
})
