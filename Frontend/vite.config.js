import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/convertFile': {
        target: 'http://localhost:8000', // assuming backend is on 8000
        changeOrigin: true,
      },
    },
  },
})
