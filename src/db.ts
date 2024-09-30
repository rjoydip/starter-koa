import type { User } from './types'
import { PGlite } from '@electric-sql/pglite'
import { uuid_ossp } from '@electric-sql/pglite/contrib/uuid_ossp'

/**
 * @type {${2:*}}
 */
const db = new PGlite({
  extensions: {
    uuid_ossp,
  },
})

/**
 * @async
 * @returns {Promise<void>}
 */
async function tablesCreate(): Promise<void> {
  await db.exec(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  
    CREATE TABLE IF NOT EXISTS healths (
      id SERIAL PRIMARY KEY,
      service TEXT,
      up BOOLEAN DEFAULT false
    );
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      _id uuid DEFAULT uuid_generate_v4() NOT NULL,
      name VARCHAR(30) NOT NULL,
      email VARCHAR(200) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      address TEXT
    );
    INSERT INTO healths (service, up) VALUES ('db', true);
  `)
}

/**
 * @export
 * @async
 * @returns {Promise<void>}
 */
export async function tablesDrop(): Promise<void> {
  const _isDBUp = await isDBUp()
  if (_isDBUp) {
    await db.exec(`
      DROP TABLE if exists healths;
      DROP TABLE if exists users;
    `)
  }
}

/**
 * @export
 * @async
 * @returns {Promise<void>}
 */
export async function initDB(): Promise<void> {
  const _isDBUp = await isDBUp()
  if (_isDBUp) {
    await tablesCreate()
  }
}

/**
 * @export
 * @async
 * @returns {Promise<void>}
 */
export async function dbDown(): Promise<void> {
  await tablesDrop()
  await db.close()
}

/**
 * @export
 * @async
 * @returns Promise<boolean>
 */
export async function isDBUp(): Promise<boolean> {
  await db.waitReady
  return await db.ready
}

/* User Queries - Start */
/**
 * @export
 * @async
 * @param {string} id
 * @returns Promise<User | undefined>
 */
export async function getUser(id: string): Promise<User | undefined> {
  const { rows } = (await db.query<User>(`SELECT _id, name, email, phone, address from users WHERE _id = $1;`, [id]))
  return rows[0]
}

/**
 * @export
 * @async
 * @returns Promise<User[]>
 */
export async function getUsers(): Promise<User[]> {
  const { rows } = await db.query<User>(`SELECT _id, name, email, phone, address from users`, [])
  return rows
}

/**
 * @export
 * @async
 * @param {User} user
 * @returns Promise<User | undefined>
 */
export async function createUser(user: User): Promise<User | undefined> {
  return await db.transaction(async (tx) => {
    const insert = await tx.query<User>(`INSERT INTO users (name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING _id`, [user.name, user.email, user.phone, user.address])
    const { rows } = await tx.query<User>(`SELECT _id, name, email, phone, address from users WHERE _id = $1;`, [insert.rows[0]._id])
    return rows[0]
  })
}

/**
 * @export
 * @async
 * @param {string} id
 * @param {User} user
 * @returns Promise<User | undefined | []>
 */
export async function updateUser(id: string, user: User): Promise<User | undefined> {
  return await db.transaction(async (tx) => {
    await tx.query<User>(`UPDATE users SET name = $2, email = $3, phone = $4, address = $5 WHERE _id = $1;`, [id, user.name, user.email, user.phone, user.address])
    const { rows } = await tx.query<User>(`SELECT _id, name, email, phone, address from users WHERE _id = $1;`, [id])
    return rows[0]
  })
}

/**
 * @export
 * @async
 * @param {string} id
 * @returns Promise<User>
 */
export async function deleteUser(id: string): Promise<User> {
  const { rows } = (await db.query<User>(`DELETE FROM users WHERE _id = $1;`, [id]))
  return rows[0]
}
/* User Queries - Start */
