import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
   build: {
      rollupOptions: {
         input: {
            index: path.resolve(__dirname, 'html', 'index.html'),
            gamepc: path.resolve(__dirname, 'html', 'gamepc.html'),
            gamemobile: path.resolve(__dirname, 'html', 'gamemobile.html'),
            _404: path.resolve(__dirname, 'html', '404.html'),
            footer: path.resolve(__dirname, 'html', 'footer.html'),
         }
      },
      outDir: 'dist',
      emptyOutDir: true,
      target: 'esnext',
      minify: true
   }
});
