import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // Define the project root for the client-side application
  root: 'clients',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './clients/src'),
    },
  },
  build: {
    // Define the output directory relative to the project root
    outDir: '../dist/public',
    emptyOutDir: true,
  },
});

