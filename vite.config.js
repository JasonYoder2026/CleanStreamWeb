import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, 
    environment: 'jsdom', 
    setupFiles: './src/setupTests.ts',
    coverage: {
      reporter: ['text', 'lcov'],
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['node_modules/', 'src/**/*.test.{ts,tsx}', 'src/supabase/enum/*', 'src/supabase/client.ts', 'src/interfaces/*', 'src/di/*'],
    },
  },
})
