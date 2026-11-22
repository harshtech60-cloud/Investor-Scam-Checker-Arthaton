import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." still resolve in production builds.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) return;

          const distDir = path.resolve(projectRoot, 'dist');
          const srcAssets = path.resolve(projectRoot, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');

          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, { recursive: true, force: true });
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': projectRoot,
      },
    },
    build: {
      // Split the large translation dictionaries into smaller build chunks.
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'locale-copy',
                test: /src[\\/]data[\\/]locales[\\/]/,
                maxSize: 220_000,
              },
            ],
          },
        },
      },
    },
    server: {
      // Preserve AI Studio's existing hot-reload and file-watching behavior.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});