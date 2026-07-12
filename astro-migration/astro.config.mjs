// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Redirect pages that should NOT be in sitemap
const REDIRECT_PAGES = [
  '/kategori/cloud',
  '/kategori/esp32',
  '/kategori/lora',
  '/kategori/mikrotik',
  '/kategori/raspberry-pi',
  '/kategori/tools',
  '/offline',
];

// https://astro.build/config
export default defineConfig({
  site: 'https://beebanelabs.pages.dev',
  output: 'static',
  build: {
    format: 'file',
  },
  integrations: [
    sitemap({
      // Exclude redirect pages from sitemap
      filter(page) {
        return !REDIRECT_PAGES.some(r => page.includes(r));
      },
      serialize(item) {
        // Add .html to all URLs for Cloudflare Pages static serving
        if (!item.url.endsWith('.html') && !item.url.endsWith('/')) {
          item.url = item.url + '.html';
        } else if (item.url.endsWith('/') && item.url !== 'https://beebanelabs.pages.dev/') {
          item.url = item.url.replace(/\/+$/, '') + '.html';
        }
        return item;
      },
    }),
  ],
  vite: {
    css: {
      // No special config needed yet — CSS will be global
    },
  },
});
