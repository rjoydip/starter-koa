import type { User } from './types'
import { PGlite } from '@electric-sql/pglite'
import { v4 as secure } from '@lukeed/uuid/secure'

const db = new PGlite()

export async function dbClose(): Promise<void> {
  await db.close()
}

export async function dbUP(): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS healths (
      id SERIAL PRIMARY KEY,
      service TEXT,
      up BOOLEAN DEFAULT false
    );
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      _id TEXT,
      name VARCHAR(100),
      email VARCHAR(200),
      phone VARCHAR(100),
      address TEXT
    );
    INSERT INTO healths (service, up) VALUES ('db', true);
  `)
}

export async function dbDown(): Promise<void> {
  await db.exec(`
    DROP SCHEMA if exists healths;
    DROP SCHEMA if exists users;
  `)
}

export async function isDBUp(): Promise<unknown> {
  return (await db.query('SELECT 1;')).rows
}

/* User Queries - Start */
export async function getUser(id: string): Promise<User> {
  const data = (await db.query<User>(`SELECT _id, name, email, phone, address from users WHERE _id = $1;`, [id])).rows
  return data[0]
}

export async function getUsers(): Promise<User[]> {
  return (await db.query<User>(`SELECT _id, name, email, phone, address from users`, [])).rows
}

export async function setUser(user: User): Promise<User | undefined> {
  const _id = secure()
  return await db.transaction(async (tx) => {
    await tx.query<User>(`INSERT INTO users (_id, name, email, phone, address) VALUES ($1, $2, $3, $4, $5)`, [_id, user.name, user.email, user.phone, user.address])
    const data = (await tx.query<User>(`SELECT _id, name, email, phone, address from users WHERE _id = $1;`, [_id])).rows
    return data[0]
  })
}
/* User Queries - Start */
