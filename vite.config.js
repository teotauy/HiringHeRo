import { defineConfig } from 'vite';

export default defineConfig({
  // Inline the pixel font into the CSS so the build stays a small set of files.
  build: { assetsInlineLimit: 100000 },
});
