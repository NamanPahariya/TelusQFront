import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API requests to your backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // Base public path when served in production
  base: '/',
  build: {
    // Generate sourcemaps for better debugging
    sourcemap: true,
    // Output directory for production build
    outDir: 'dist',
    // Clean the output directory before build
    emptyOutDir: true,
    // Customize build output
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'ably'],
        },
      },
    },
  }
});