import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    ...(process.env.ANALYZE ? [visualizer({ open: true, filename: 'dist/bundle-report.html' })] : []),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 3000,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
        },
      },
    },
    copyPublicDir: true,
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
});