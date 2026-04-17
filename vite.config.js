import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add this line. Make sure it matches your GitHub repo name exactly!
  base: '/circuit-companion/', 
})
