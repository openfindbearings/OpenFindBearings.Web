import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api/account': {
        target: 'https://localhost:7201',
        changeOrigin: true,
        secure: false,
      },
      '/connect': {
        target: 'https://localhost:7201',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
