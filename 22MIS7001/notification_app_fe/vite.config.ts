import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.resolve(currentDir, './src/app'),
      '@shared': path.resolve(currentDir, './src/shared'),
      '@features': path.resolve(currentDir, './src/features'),
      '@providers': path.resolve(currentDir, './src/providers')
    }
  },
  server: {
    host: 'localhost',
    port: 3000,
    strictPort: true
  },
  preview: {
    host: 'localhost',
    port: 3000,
    strictPort: true
  }
});
