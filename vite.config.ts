import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' keeps asset paths relative, so the build works on GitHub Pages
// sub-paths as well as at a domain root.
export default defineConfig({
  plugins: [react()],
  base: './',
});