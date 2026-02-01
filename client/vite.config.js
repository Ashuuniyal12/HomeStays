import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: 'all',
    proxy: {
      '/api': {
        //locla dev
        // target: 'http://localhost:3000',
        target: 'https://homestays-server-7qfq.onrender.com',
        changeOrigin: true,
      },
      '/socket.io': {
        //locla dev
        // target: 'http://localhost:3000',
        //production
        target: 'https://homestays-server-7qfq.onrender.com',
        changeOrigin: true,
        ws: true
      }
    }
  }
})
