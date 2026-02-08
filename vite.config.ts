import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()] as PluginOption[],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  css: {
    postcss: { plugins: [] },
  },
})
