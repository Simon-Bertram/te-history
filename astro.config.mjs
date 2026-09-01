import tailwindcss from "@tailwindcss/vite";
// @ts-check
import { defineConfig } from 'astro/config';

import sanity from '@sanity/astro';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        'astro/app/manifest',
        'astro/assets/services/noop',
        '@sanity/client',
        '@sanity/image-url',
        'astro-portabletext',
      ],
    },
  },

  integrations: [
    sanity({
      projectId: 'z8o776vu',
      dataset: 'production',
      apiVersion: '2026-01-01',
      useCdn: false,
    }),
  ],

  adapter: cloudflare({
    imageService: 'passthrough',
  }),
  session: false,
});
