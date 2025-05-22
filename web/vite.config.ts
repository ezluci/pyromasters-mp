import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
   build: {
      rollupOptions: {
         input: {
            main: path.resolve(__dirname, 'gamemobile.html'),
            game: path.resolve(__dirname, 'gamepc.html')
         }
      },
      outDir: 'dist',
      emptyOutDir: true,
      target: 'esnext',
      minify: false
   }
});
