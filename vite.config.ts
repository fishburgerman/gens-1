/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import pkg from './package.json' with { type: 'json' }

// GitHub Pages serves this repo at https://<user>.github.io/gens-1/
// Keep `base` in sync with the repository name.
export default defineConfig({
  base: '/gens-1/',
  plugins: [react(), tailwindcss()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
