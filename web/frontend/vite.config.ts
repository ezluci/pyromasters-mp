import { defineConfig } from 'vite';

export default defineConfig({
   build: {
      rollupOptions: {
         input: {
            index: `${__dirname}/index.html`,
            gamepc: `${__dirname}/gamepc.html`,
            gamemobile: `${__dirname}/gamemobile.html`,
            footer: `${__dirname}/footer.html`,
            topbar: `${__dirname}/topbar.html`
         }
      },
      outDir: '../public',
      emptyOutDir: true,
      target: 'esnext',
      minify: true
   }
});
