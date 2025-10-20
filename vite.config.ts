import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// [https://vitejs.dev/config/](https://vitejs.dev/config/)
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Эта строка - ключ к решению проблемы.
      // Она говорит Vite, что "@" - это псевдоним для папки "client/src"
      '@': path.resolve(__dirname, './client/src'),
    },
  },
});
