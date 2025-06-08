import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Replace 'MushuAlberto' with the actual name of your GitHub repository
  // if it's different and you were deploying to GitHub Pages.
  // For lovable.dev, './' is often a safer default if it builds and serves from a dynamic root.
  base: './', // Changed to './' for better portability in environments like lovable.dev
  server: {
    port: 8080, // Configure Vite to use port 8080 as requested by lovable.dev
    host: true, // Optional: makes it accessible on your network if needed by lovable.dev's preview
  },
})