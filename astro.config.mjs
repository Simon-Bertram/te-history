import tailwindcss from "@tailwindcss/vite";
// @ts-check
import { defineConfig } from 'astro/config';

import sanity from '@sanity/astro';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sanity({
      projectId: 'z8o776vu',
      dataset: 'production',
      apiVersion: '2026-01-01',
      useCdn: false,
    }),
  ],
});

