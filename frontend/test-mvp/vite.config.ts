import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isBackendRunning = false; // Switch to True

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: isBackendRunning ? {
      '/api': {
        target: 'http://127.0.0.1:8000', // Address of Django
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    } : {},
  },
})