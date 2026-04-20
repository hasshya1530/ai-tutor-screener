import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../backend/static',  // Build React INTO backend folder
    emptyOutDir: true
  },
  server: {
    port: 5173,
    host: true
  }
})