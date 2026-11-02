import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Explicit (empty) PostCSS config so a stray config higher up the filesystem is never picked up.
  css: { postcss: { plugins: [] } },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    // three.js is ~250 kB gzip by itself; it is lazy-loaded behind React.lazy, off the critical path.
    chunkSizeWarningLimit: 1000,
  },
})
