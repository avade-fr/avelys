import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: ['avelys.internal'],
    hmr: process.env.VITE_HMR_HOST
      ? {
          host: process.env.VITE_HMR_HOST,
          clientPort: Number(process.env.VITE_HMR_PORT || 5173),
        }
      : undefined,
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
})
