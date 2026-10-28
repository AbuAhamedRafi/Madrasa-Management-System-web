import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    host: '0.0.0.0',
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_INTERNAL_URL || 'http://host.docker.internal:8000',
        changeOrigin: true,
      },
      '/sanctum': {
        target: process.env.VITE_BACKEND_INTERNAL_URL || 'http://host.docker.internal:8000',
        changeOrigin: true,
      },
      '/login': {
        target: process.env.VITE_BACKEND_INTERNAL_URL || 'http://host.docker.internal:8000',
        changeOrigin: true,
      },
      '/logout': {
        target: process.env.VITE_BACKEND_INTERNAL_URL || 'http://host.docker.internal:8000',
        changeOrigin: true,
      },
    },
  },
})
