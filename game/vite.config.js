import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The Game is its own app but reads the Guide's shared data modules from
// ../src/data (read-only). `fs.allow: ['..']` lets the dev server serve those
// files; production builds bundle them in directly.
export default defineConfig({
  plugins: [react()],
  server: { fs: { allow: ['..'] } },
});
