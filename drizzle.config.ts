import type { Config } from 'drizzle-kit'
import config from './src/config'

export default {
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: config.db_url!,
  },
} satisfies Config
