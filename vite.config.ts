import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// [https://vitejs.dev/config/](https://vitejs.dev/config/)
export default defineConfig({
  // The react plugin provides automatic JSX transformation and Fast Refresh.
  plugins: [react()],

  // Path alias configuration.
  // This tells Vite that any import starting with '@/'
  // should be resolved from the './client/src' directory.
  // This is the key to fixing all compilation errors.
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },

  // Proxy configuration for the development server.
  // This forwards any requests from the client to '/api'
  // to your backend server running on port 5000.
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
});
