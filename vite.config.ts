import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          changeOrigin: true,
          target: env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:5000',
        },
        '/socket.io': {
          changeOrigin: true,
          target: env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:5000',
          ws: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  };
});
