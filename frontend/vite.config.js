import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The Docker/Nginx deployment serves the app from the web-server root.
export default defineConfig({
  plugins: [react()],
  base: '/',
})
