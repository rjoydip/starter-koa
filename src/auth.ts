import type { Auth } from 'better-auth'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import config from './config'
import { db } from './db'

export const auth: Auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: config.github_client_id,
      clientSecret: config.github_client_secrt,
    },
  },
})
