// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'], // This helps deduplicate React
  },
  optimizeDeps: {
    include: ['react', 'react-dom'], // Force inclusion
  },
})