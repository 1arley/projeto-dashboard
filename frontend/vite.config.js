import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    port: 5173,
    strictPort: true,

    /* ── Proxy dev: /api/ → Django ───────────────
       - Docker:      VITE_PROXY_TARGET=http://web:8000  (definido no docker-compose)
       - Local (npm): usa http://localhost:8000 por omissão
    */
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
