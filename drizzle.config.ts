import type { Config } from 'drizzle-kit'
import config from './src/config'

export default {
  schema: './schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  driver: 'turso',
  dbCredentials: {
    url: config.db_url!,
    authToken: config.db_auth_token!,
  },
} satisfies Config
