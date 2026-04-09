import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        gamepc: 'gamepc.html',
        gamemobile: 'gamemobile.html',
        footer: 'footer.html',
        topbar: 'topbar.html',
        profile: 'profile.html',
      },
    },
    outDir: '../public',
    emptyOutDir: true,
    target: 'esnext',
    minify: true,
  },
  server: {
    cors: true,
    hmr: {
      host: 'localhost',
    },
  },
});
