import type { User } from './types'
import { PGlite } from '@electric-sql/pglite'
import { v4 as secure } from '@lukeed/uuid/secure'

const db = new PGlite()

async function tablesCreate(): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS healths (
      id SERIAL PRIMARY KEY,
      service TEXT,
      up BOOLEAN DEFAULT false
    );
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      _id TEXT,
      name VARCHAR(30),
      email VARCHAR(200),
      phone VARCHAR(20),
      address TEXT
    );
    INSERT INTO healths (service, up) VALUES ('db', true);
  `)
}

export async function tablesDrop(): Promise<void> {
  const _isDBUp = await isDBUp()
  if (_isDBUp) {
    await db.exec(`
      DROP TABLE if exists healths;
      DROP TABLE if exists users;
    `)
  }
}

export async function initDB(): Promise<void> {
  const _isDBUp = await isDBUp()
  if (_isDBUp) {
    await tablesCreate()
  }
}

export async function dbDown(): Promise<void> {
  await tablesDrop()
  await db.close()
}

export async function isDBUp(): Promise<boolean> {
  await db.waitReady
  return await db.ready
}

/* User Queries - Start */
export async function getUser(id: string): Promise<User> {
  const { rows } = (await db.query<User>(`SELECT _id, name, email, phone, address from users WHERE _id = $1;`, [id]))
  return rows[0]
}

export async function getUsers(): Promise<User[]> {
  const { rows } = await db.query<User>(`SELECT _id, name, email, phone, address from users`, [])
  return rows
}

export async function setUser(user: User): Promise<User | undefined> {
  const _id = secure()
  return await db.transaction(async (tx) => {
    await tx.query<User>(`INSERT INTO users (_id, name, email, phone, address) VALUES ($1, $2, $3, $4, $5)`, [_id, user.name, user.email, user.phone, user.address])
    const { rows } = await tx.query<User>(`SELECT _id, name, email, phone, address from users WHERE _id = $1;`, [_id])
    return rows[0]
  })
}

export async function updateUser(id: string, user: User): Promise<User | undefined | []> {
  return await db.transaction(async (tx) => {
    await tx.query<User>(`UPDATE users SET name = $2, email = $3, phone = $4, address = $5 WHERE _id = $1;`, [id, user.name, user.email, user.phone, user.address])
    const { rows } = await tx.query<User>(`SELECT _id, name, email, phone, address from users WHERE _id = $1;`, [id])
    return rows[0]
  })
}

export async function deleteUser(id: string): Promise<User> {
  const { rows } = (await db.query<User>(`DELETE FROM users WHERE _id = $1;`, [id]))
  return rows[0]
}
/* User Queries - Start */
