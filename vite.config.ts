import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('leaflet')) return 'leaflet';
            if (id.includes('react')) return 'react';
            if (id.includes('zustand')) return 'zustand';
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ['leaflet', 'zustand'],
  },
  server: {
    port: 5173,
    open: true,
  },
});
