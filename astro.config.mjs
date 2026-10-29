import tailwindcss from "@tailwindcss/vite";
// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

import sanity from '@sanity/astro';
import icon from 'astro-icon';

import cloudflare from '@astrojs/cloudflare';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), 'PUBLIC_');
const site = (env.PUBLIC_SITE_URL || 'https://te-history.workers.dev').replace(/\/$/, '');
const projectId = env.PUBLIC_SANITY_PROJECT_ID || 'z8o776vu';
const dataset = env.PUBLIC_SANITY_DATASET || 'production';
const apiVersion = env.PUBLIC_SANITY_API_VERSION || '2026-01-01';

// https://astro.build/config
export default defineConfig({
  site,
  output: 'static',
  build: {
    inlineStylesheets: 'always',
  },
  fonts: [
    {
      name: 'Newsreader',
      cssVariable: '--font-newsreader',
      provider: fontProviders.google(),
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin'],
      display: 'swap',
      fallbacks: ['Georgia', 'Times New Roman', 'serif'],
    },
    {
      name: 'Public Sans',
      cssVariable: '--font-public-sans',
      provider: fontProviders.google(),
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin'],
      display: 'optional',
      fallbacks: ['Arial', 'Helvetica', 'sans-serif'],
    },
  ],
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
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
    }),
    icon(),
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname.replace(/\/$/, '') || '/';
        return pathname !== '/404';
      },
      customPages: [
        `${site}/search`,
        `${site}/images`,
        `${site}/documents`,
        `${site}/research`,
      ],
    }),
  ],

  adapter: cloudflare({
    imageService: 'passthrough',
  }),
  session: false,
});
