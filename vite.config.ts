import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // More specific aliases first (longer paths)
      { find: '@/integrations', replacement: path.resolve(__dirname, './integrations') },
      { find: '@/components', replacement: path.resolve(__dirname, './src/components') },
      { find: '@/lib', replacement: path.resolve(__dirname, './src/lib') },
      { find: '@/hooks', replacement: path.resolve(__dirname, './src/hooks') },
      // Generic @ alias last (shorter path)
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
  server: {
    host: true,
    port: 4321,
    proxy: {
      '/api': {
        target: (process.env.VITE_API_URL || 'https://dddda.onrender.com').replace(/\/api\/?$/, ''),
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
