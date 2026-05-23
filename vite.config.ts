// @ts-nocheck — Vite 8 uses Rolldown; object manualChunks kept per project config (+ rolldownOptions groups)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          motion: ['framer-motion'],
          math: ['mathjs'],
        },
      },
    },
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor',
              test: /node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//,
            },
            { name: 'charts', test: /node_modules\/(recharts|d3-|victory)/ },
            { name: 'motion', test: /node_modules\/framer-motion/ },
            { name: 'math', test: /node_modules\/mathjs/ },
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
