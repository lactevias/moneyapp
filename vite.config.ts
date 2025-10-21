import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// This is the definitive Vite configuration for this project.
export default defineConfig({
  // Sets the project root to the 'clients' directory.
  // This is the most critical fix, making all other paths work correctly.
  root: 'clients',
  
  plugins: [react()],

  resolve: {
    // This alias now works reliably because the 'root' is correctly set.
    alias: {
      '@': path.resolve(__dirname, './clients/src'),
    },
  },

  build: {
    // Specifies the output directory relative to the project root (not the 'clients' root).
    outDir: '../dist/public',
    emptyOutDir: true,
  },
});

