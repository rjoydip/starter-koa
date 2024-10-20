import type { UserInput, UserSelect } from './schema.ts'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq, sql } from 'drizzle-orm/sql'
import { createSchema } from 'graphql-yoga'
import { cache } from './cache.ts'
import config from './config.ts'
import resolvers from './resolvers.ts'
import { users } from './schema.ts'
import typeDefs from './typedefs.ts'

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
 * @returns Promise<UserSelect[]>
 */
export async function getUsers(): Promise<UserSelect[]> {
  const cacheKey = 'all_users'

  const cachedUsers = await cache.get<UserSelect[]>(cacheKey)
  if (cachedUsers) {
    return cachedUsers
  }

  const result = await db.select().from(users)
  cache.set(cacheKey, result)
  return result
}

/* User Queries - Start */
/**
 * @export
 * @async
 * @param {string} id
 * @returns Promise<UserSelect>
 */
export async function getUser(id: string): Promise<UserSelect> {
  const cacheKey = `user_${id}`

  const cachedUser = await cache.get<UserSelect>(cacheKey)
  if (cachedUser) {
    return cachedUser
  }

  const result = await db.select().from(users).where(eq(users.id, id))
  const user = result[0]
  cache.set(cacheKey, user)
  return user
}

/**
 * @export
 * @async
 * @param {UserInput} user
 * @returns Promise<UserInput>
 */
export async function createUser(user: UserInput): Promise<UserInput> {
  const result = await db.insert(users).values(user).returning()
  await cache.delete('all_users')
  return result[0]
}

/**
 * @export
 * @async
 * @param {string} id
 * @param {UserInput} user
 * @returns Promise<UserInput>
 */
export async function updateUser(id: string, user: UserInput): Promise<UserInput> {
  const result = await db.update(users).set({ updatedAt: sql`NOW()`, ...user }).where(eq(users.id, id)).returning()
  await cache.set(`user_${id}`, result[0])
  await cache.delete('all_users')
  return result[0]
}

/**
 * @export
 * @async
 * @param {string} id
 * @returns Promise<void>
 */
export async function deleteUser(id: string): Promise<{ id: string }> {
  const result = await db.delete(users).where(eq(users.id, id)).returning({
    id: users.id,
  })
  await cache.delete(`user_${id}`)
  await cache.delete('all_users')
  return result[0]
}
/* User Queries - Start */

export const graphqlSchema = createSchema({
  typeDefs,
  resolvers,
})
