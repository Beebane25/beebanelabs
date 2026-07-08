// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://beebanelabs.pages.dev',
  output: 'static',
  build: {
    format: 'file',
  },
  integrations: [
    sitemap(),
  ],
  vite: {
    css: {
      // No special config needed yet — CSS will be global
    },
  },
});
