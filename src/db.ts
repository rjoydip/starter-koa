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

/**
 * Returns a record of fields for User selection from the database.
 *
 * @returns {Record<keyof UserSelect, any>} A record of user fields for selection.
 */
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

/**
 * Database interface for PostgreSQL using `db0`.
 *
 * @type {any}
 */
export const dbInterface = createDatabase(
  postgresql({
    url: config.db_url!,
  }),
)

/**
 * Drizzle ORM database instance.
 *
 * @type {any}
 */
export const db = drizzle(dbInterface)

/**
 * Checks if the cache storage is operational.
 *
 * @async
 * @export
 * @returns {Promise<boolean>} Returns true if cache is accessible, false otherwise.
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
 * Checks if the database connection is operational.
 *
 * @async
 * @export
 * @returns {Promise<boolean>} Returns true if the database is accessible, false otherwise.
 */
export async function isDBUp(): Promise<boolean> {
  try {
    await dbInterface.exec('SELECT 1')
    return true
  }
  catch (err) {
    logger.error(err)
    captureException(err)
    return false
  }
}

/**
 * Retrieves a paginated list of users from the database, with optional caching.
 *
 * @async
 * @export
 * @param {object} [options] - Optional pagination parameters.
 * @param {number} [options.page] - Page number for pagination.
 * @param {number} [options.pageSize] - Number of users per page.
 * @returns {Promise<UserSelect[]>} A promise resolving to an array of users.
 */
export async function getUsers({
  page = 1,
  pageSize = 10,
}: { page?: number, pageSize?: number } = {}): Promise<UserSelect[]> {
  const offset = (page - 1) * pageSize
  const cacheKey = `users_page_${page}_size_${pageSize}`

  // Attempt to retrieve cached results
  const cachedUsers = await cache.get<UserSelect[]>(cacheKey)
  if (cachedUsers)
    return cachedUsers

  // Fetch users from database if no cache exists
  const results = await db.select(returningFields()).from(users).offset(offset).limit(pageSize).execute()

  // Cache the results for future requests
  await cache.set(cacheKey, results)
  return results
}

/**
 * Retrieves a single user by ID, with optional caching.
 *
 * @async
 * @export
 * @param {string} id - The ID of the user to retrieve.
 * @returns {Promise<UserSelect>} A promise resolving to the retrieved user data.
 */
export async function getUser(id: string): Promise<UserSelect> {
  const cacheKey = `user_${id}`

  // Attempt to retrieve cached user data
  const cachedUser = await cache.get<UserSelect>(cacheKey)
  if (cachedUser)
    return cachedUser

  // Fetch user data from database if no cache exists
  const result = await db.select(returningFields()).from(users).where(eq(users.id, id)).execute()
  const user = result[0]

  // Cache the result for future requests
  await cache.set(cacheKey, user)
  return user
}

/**
 * Creates a new user and stores the result in the cache.
 *
 * @async
 * @export
 * @param {UserInput} user - The user data to insert into the database.
 * @returns {Promise<UserSelect>} A promise resolving to the created user data.
 */
export async function createUser(user: UserInput): Promise<UserSelect> {
  const [newUser] = await db.insert(users).values({
    ...user,
    password: sha256(user.password), // Hashes password before storage
  }).returning(returningFields()).execute()

  // Update cache with the new user data and reset all-users cache
  await cache.set(`user_${newUser.id}`, newUser)
  await cache.del('all_users')
  return newUser
}

/**
 * Updates a user's data by ID, excluding password, and refreshes the cache.
 *
 * @async
 * @export
 * @param {string} id - The ID of the user to update.
 * @param {Omit<UserInput, 'password'>} user - Updated user data, excluding password.
 * @returns {Promise<UserSelect>} A promise resolving to the updated user data.
 */
export async function updateUser(id: string, user: Omit<UserInput, 'password'>): Promise<UserSelect> {
  const [updatedUser] = await db.update(users)
    .set({ updatedAt: sql`NOW()`, ...user })
    .where(eq(users.id, id))
    .returning(returningFields())
    .execute()

  // Refresh user cache and reset all-users cache
  await cache.set(`user_${id}`, updatedUser)
  await cache.del('all_users')
  return updatedUser
}

/**
 * Deletes a user by ID and removes the user from cache.
 *
 * @async
 * @export
 * @param {string} id - The ID of the user to delete.
 * @returns {Promise<UserSelect>} A promise resolving to the deleted user data.
 */
export async function deleteUser(id: string): Promise<UserSelect> {
  const [deletedUser] = await db.delete(users)
    .where(eq(users.id, id))
    .returning(returningFields())
    .execute()

  // Remove deleted user from cache and reset all-users cache
  await cache.del(`user_${id}`)
  await cache.del('all_users')
  return deletedUser
}
