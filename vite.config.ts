import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import webExtension from 'vite-plugin-web-extension';
import manifest from './src/manifest.config.ts';

const srcPath = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    // Tailwind v4 runs as a first-class Vite plugin. There is no postcss.config.js and no
    // autoprefixer: v4 handles vendor prefixing itself through Lightning CSS.
    tailwindcss(),
    webExtension({
      manifest: () => manifest,
      browser: 'chrome',
    }),
  ],
  resolve: {
    alias: {
      '@': srcPath,
      '@shared': `${srcPath}/shared`,
    },
  },
  build: {
    // The extension is loaded unpacked and reviewed by hand; readable output is worth more
    // than the few kilobytes minification would save on a panel nobody downloads over 3G.
    sourcemap: true,
  },
});
