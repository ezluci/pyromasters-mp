import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
   build: {
      rollupOptions: {
         input: {
            index: path.resolve(__dirname, 'index.html'),
            gamepc: path.resolve(__dirname, 'gamepc.html'),
            gamemobile: path.resolve(__dirname, 'gamemobile.html')
         }
      },
      outDir: 'dist',
      emptyOutDir: true,
      target: 'esnext',
      minify: true
   }
});
