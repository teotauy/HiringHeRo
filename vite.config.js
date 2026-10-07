import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths so the build works under a GitHub Pages subpath (/HiringHeRo/).
  base: './',
  // Inline the pixel font into the CSS so the build stays a small set of files.
  build: { assetsInlineLimit: 100000 },
});
