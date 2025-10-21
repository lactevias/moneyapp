import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // Explicitly set the project root for the client application.
  // This is the key fix that makes all path aliases work correctly.
  root: 'clients',
  plugins: [react()],
  resolve: {
    alias: {
      // Define the '@' alias to point to the 'src' folder inside our root.
      '@': path.resolve(__dirname, 'clients/src'),
    },
  },
  build: {
    // Specify the output directory relative to the project's root folder.
    outDir: '../dist/public',
    // It's a good practice to clear the output directory before building.
    emptyOutDir: true,
  },
});

