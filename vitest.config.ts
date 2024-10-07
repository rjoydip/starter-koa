import { cwd } from 'node:process'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => {
  return {
    test: {
      env: loadEnv(mode, cwd(), ''),
    },
  }
})
