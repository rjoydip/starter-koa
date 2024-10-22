import type { UserInput, UserSelect } from './schema.ts'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq, sql } from 'drizzle-orm/sql'
import { createSchema } from 'graphql-yoga'
import { sha256 } from 'ohash'
import { cache } from './cache.ts'
import config from './config.ts'
import resolvers from './resolvers.ts'
import { users } from './schema.ts'
import typeDefs from './typedefs.ts'

const neonClient = neon(config.db_url!)
export const db = drizzle(neonClient)

const returningFields = {
  id: users.id,
  name: users.name,
  email: users.email,
  phone: users.phone,
  address: users.address,
  isVerified: users.isVerified,
  role: users.role,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
}

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

  const result = await db.select(returningFields).from(users)
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

  const result = await db.select(returningFields).from(users).where(eq(users.id, id))
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
export async function createUser(user: UserInput): Promise<UserSelect> {
  const [newUser] = await db.insert(users).values({
    ...user,
    password: sha256(user.password),
  }).returning(returningFields)
  await cache.delete('all_users')
  return newUser
}

/**
 * @export
 * @async
 * @param {string} id
 * @param {UserInput} user
 * @returns Promise<UserInput>
 */
export async function updateUser(id: string, user: Omit<UserInput, 'password'>): Promise<UserSelect> {
  const [updatedUser] = await db.update(users).set({ updatedAt: sql`NOW()`, ...user }).where(eq(users.id, id)).returning(returningFields)
  await cache.set(`user_${id}`, updatedUser)
  await cache.delete('all_users')
  return updatedUser
}

/**
 * @export
 * @async
 * @param {string} id
 * @returns Promise<void>
 */
export async function deleteUser(id: string): Promise<{ id: string }> {
  const [deletedUser] = await db.delete(users).where(eq(users.id, id)).returning({
    id: users.id,
  })
  await cache.delete(`user_${id}`)
  await cache.delete('all_users')
  return deletedUser
}
/* User Queries - Start */

export const graphqlSchema = createSchema({
  typeDefs,
  resolvers,
})
