import { fileURLToPath, URL } from 'url';

import { sveltekit } from '@sveltejs/kit/vite';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import { sveltePreprocess } from 'svelte-preprocess';
import { checker } from 'vite-plugin-checker';
import { defineConfig } from 'vitest/config';

import type { PluginOption } from 'vite';

const plugins: PluginOption[] = [];

if (process.env.NODE_ENV === 'development') {
  plugins.push(
    svelte({
      preprocess: sveltePreprocess(),
    }),
    checker({
      typescript: {
        tsconfigPath: 'tsconfig.json',
      },
    }),
  );
} else if (process.env.VITE_MODE === 'WEB') {
  // TODO implement web mode
  plugins.push(
    svelte({
      preprocess: sveltePreprocess(),
    }),
  );
} else {
  plugins.push(sveltekit());
}

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src/lib', import.meta.url)),
    },
  },
  server: {
    port: 3303,
    open: true,
  },
  preview: {
    port: 3304,
    open: true,
  },
  test: {
    include: ['**/*.{test,spec}.{js,ts}'],
    alias: {
      '~/': fileURLToPath(new URL('./src/lib', import.meta.url)),
    },
  },
});
