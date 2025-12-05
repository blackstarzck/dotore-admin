import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      components: path.resolve(__dirname, './src/components'),
      context: path.resolve(__dirname, './src/context'),
      pages: path.resolve(__dirname, './src/pages'),
      layout: path.resolve(__dirname, './src/layout'),
      utils: path.resolve(__dirname, './src/utils'),
      types: path.resolve(__dirname, './src/types'),
      data: path.resolve(__dirname, './src/data'),
      themes: path.resolve(__dirname, './src/themes'),
      'menu-items': path.resolve(__dirname, './src/menu-items'),
    },
  },
});
