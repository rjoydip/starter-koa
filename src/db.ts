import type { User } from './types'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq, sql } from 'drizzle-orm/sql'
import { createSchema } from 'graphql-yoga'
import config from './config'
import resolvers from './resolvers'
import { users } from './schema'
import typeDefs from './typedefs'

const neonClient = neon(config.db_url!)
export const db = drizzle(neonClient)

/**
 * @export
 * @async
 * @returns Promise<boolean>
 */
export async function isDBUp(): Promise<boolean> {
  try {
    await db.execute(sql`select 1`)
    return true
  } /* eslint-disable unused-imports/no-unused-vars */
  catch (_: unknown) {
    return false
  }
}

/**
 * @export
 * @async
 * @returns Promise<User[]>
 */
export async function getUsers(): Promise<User[]> {
  return await db.select().from(users)
}

/* User Queries - Start */
/**
 * @export
 * @async
 * @param {number} id
 * @returns Promise<User>
 */
export async function getUser(id: number): Promise<User> {
  const result = await db.select().from(users).where(eq(users.id, id))
  return result[0]
}

/**
 * @export
 * @async
 * @param {User} user
 * @returns Promise<User>
 */
export async function createUser(user: User): Promise<User> {
  const result = await db.insert(users).values(user).returning()
  return result[0]
}

/**
 * @export
 * @async
 * @param {number} id
 * @param {User} user
 * @returns Promise<User>
 */
export async function updateUser(id: number, user: User): Promise<User> {
  const result = await db.update(users).set({ updatedAt: sql`NOW()`, ...user }).where(eq(users.id, id)).returning()
  return result[0]
}

/**
 * @export
 * @async
 * @param {number} id
 * @returns Promise<void>
 */
export async function deleteUser(id: number): Promise<{ id: number }> {
  const result = await db.delete(users).where(eq(users.id, id)).returning({
    id: users.id,
  })
  return result[0]
}
/* User Queries - Start */

export const graphqlSchema = createSchema({
  typeDefs,
  resolvers,
})
