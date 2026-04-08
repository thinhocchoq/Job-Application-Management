import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  root: path.dirname(fileURLToPath(import.meta.url)),
  plugins: [react()],
})
