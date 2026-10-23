import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  // Pages serves the site under /<repo>/; local build and preview stay at /.
  base: process.env.GITHUB_ACTIONS ? '/fleet-management-frontend/' : '/',
  plugins: [react(), tailwindcss()],
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts' },
})
