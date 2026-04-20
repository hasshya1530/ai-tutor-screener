import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Directs any path starting with these to the Python backend
      '/questions': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
      '/evaluate': 'http://localhost:8000',
      '/evaluate-text': 'http://localhost:8000',
    }
  }
})