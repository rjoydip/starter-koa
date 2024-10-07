import type { User } from './types'
import { neon } from '@neondatabase/serverless'
import { buildSchema } from 'drizzle-graphql'
import { eq, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'
import config from './config'
import { users, UserSchema } from './schema'

const neonClient = neon(config.db_url!)
const db = drizzle(neonClient, { schema: UserSchema })
export const { schema } = buildSchema(db)

/**
 * @export
 * @async
 * @returns {Promise<void>}
 */
export async function tablesDrop(): Promise<void> {
  await sql`
    DROP TABLE if exists users;
  `
}

/**
 * @export
 * @async
 * @returns {Promise<boolean>}
 */
export async function isDBUp(): Promise<boolean> {
  try {
    await sql`SELECT 1;`
    return true
  }
  /* eslint-disable unused-imports/no-unused-vars */
  catch (_: any) {
    return false
  }
}

/**
 * @export
 * @async
 * @returns {Promise<void>}
 */
export async function dbDown(): Promise<void> {
  await tablesDrop()
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
  return await db.select().from(users).where(eq(users.id, id))
}

/**
 * @export
 * @async
 * @param {User} user
 * @returns Promise<User>
 */
export async function createUser(user: User): Promise<User> {
  return await db.insert(users).values(user).returning()
}

/**
 * @export
 * @async
 * @param {number} id
 * @param {User} user
 * @returns Promise<User>
 */
export async function updateUser(id: number, user: User): Promise<User> {
  return await db.update(users).set({ updatedAt: sql`NOW()`, ...user }).where(eq(users.id, id)).returning()
}

/**
 * @export
 * @async
 * @param {number} id
 * @returns Promise<void>
 */
export async function deleteUser(id: number): Promise<void> {
  await db.delete(users).where(eq(users.id, id))
}
/* User Queries - Start */
