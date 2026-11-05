import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Web-first build, relative base so the same bundle can be wrapped by Capacitor.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5180,
  },
});
