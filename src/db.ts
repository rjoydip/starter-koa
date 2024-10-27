import type { UserInput, UserSelect } from './schema.ts'
import { v4 as uuid } from '@lukeed/uuid/secure'
import { createDatabase } from 'db0'
import postgresql from 'db0/connectors/postgresql'
import { drizzle } from 'db0/integrations/drizzle'
import { eq, sql } from 'drizzle-orm/sql'
import { sha256 } from 'ohash'
import cache from './cache.ts'
import config from './config.ts'
import logger from './logger.ts'
import { users } from './schema.ts'
import { captureException } from './utils.ts'

function returningFields(): Record<keyof UserSelect, any> {
  return {
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
}

export const dbInterface = createDatabase(
  postgresql({
    url: config.db_url,
  }),
)
export const db = drizzle(dbInterface)

/**
 * @export
 * @async
 * @returns Promise<boolean>
 */
export async function isCacheUp(): Promise<boolean> {
  try {
    await cache.get(uuid())
    return true
  }
  catch (err) {
    logger.error(err)
    captureException(err)
    return false
  }
}

/**
 * @export
 * @async
 * @returns Promise<boolean>
 */
export async function isDBUp(): Promise<boolean> {
  try {
    await dbInterface.exec(`select 1`)
    return true
  }
  catch (err) {
    logger.error(err)
    captureException(err)
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

  const result = await db.select(returningFields()).from(users)
  await cache.set(cacheKey, result)
  return result
}

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

  const result = await db.select(returningFields()).from(users).where(eq(users.id, id))
  const user = result[0]
  await cache.set(cacheKey, user)
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
  }).returning(returningFields())
  await cache.del('all_users')
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
  const [updatedUser] = await db.update(users).set({ updatedAt: sql`NOW()`, ...user }).where(eq(users.id, id)).returning(returningFields())
  await cache.set(`user_${id}`, updatedUser)
  await cache.del('all_users')
  return updatedUser
}

/**
 * @export
 * @async
 * @param {string} id
 * @returns Promise<UserSelect>
 */
export async function deleteUser(id: string): Promise<UserSelect> {
  const [deletedUser] = await db.delete(users).where(eq(users.id, id)).returning(returningFields())
  await cache.del(`user_${id}`)
  await cache.del('all_users')
  return deletedUser
}
