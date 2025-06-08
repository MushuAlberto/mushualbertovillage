import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Replace 'MushuAlberto' with the actual name of your GitHub repository
  // if it's different.
  // If your repository is for a user/organization page (e.g., your-username.github.io),
  // then base should be '/'.
  base: '/MushuAlberto/',
})