import { defineConfig } from 'vitest/config'
import path from 'path'

// Provide required environment variables for tests
process.env.ENCRYPTION_KEY = '0000000000000000000000000000000000000000000000000000000000000000'
process.env.META_APP_SECRET = 'dummy_secret_for_testing'

export default defineConfig({
  test: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
