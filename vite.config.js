import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-ui': ['framer-motion', 'lucide-react'],
          'vendor-charts': ['chart.js', 'react-chartjs-2', 'recharts'],
          'vendor-core': ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
        }
      }
    }
  }
})

