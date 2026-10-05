import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        adminLogin: fileURLToPath(new URL('./admin/login.html', import.meta.url)),
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/public': 'http://localhost:3000',
      '/chat': 'http://localhost:3000',
      '/inscricao': 'http://localhost:3000',
      '/admin': 'http://localhost:3000',
      '/cursos': 'http://localhost:3000',
      '/inscritos': 'http://localhost:3000',
      '/certificado': 'http://localhost:3000',
    },
  },
});
