// @ts-check

import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import sanity from '@sanity/astro';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  vite: {
      plugins: [tailwindcss()],
    },

  integrations: [
    sanity({
      projectId: "4fqkkmt0",
      dataset: "production",
      useCdn: false, // for static builds
    }),
  ],

  adapter: netlify(),
});