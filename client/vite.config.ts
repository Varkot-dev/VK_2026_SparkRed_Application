import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Same-origin in dev too, so session cookies behave exactly as in production.
    proxy: { '/api': { target: 'http://localhost:3000', changeOrigin: false } },
  },
});
