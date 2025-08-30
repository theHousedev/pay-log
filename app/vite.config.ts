import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: parseInt(process.env.SITE_FRONTEND_PORT || '5173'),
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${process.env.SITE_BACKEND_PORT || '5000'}`,
        changeOrigin: true,
      }
    }
  }
})