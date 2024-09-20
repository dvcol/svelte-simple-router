import { fileURLToPath, URL } from 'url';

import { sveltekit } from '@sveltejs/kit/vite';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import { sveltePreprocess } from 'svelte-preprocess';
import { checker } from 'vite-plugin-checker';
import { defineConfig, type UserConfig } from 'vitest/config';

import type { PluginOption } from 'vite';

const plugins: PluginOption[] = [];
const isDev = process.env.NODE_ENV === 'development';
const isWeb = process.env.VITE_MODE === 'WEB';

if (isDev) {
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
} else if (isWeb) {
  plugins.push(
    svelte({
      preprocess: sveltePreprocess(),
    }),
  );
} else {
  plugins.push(sveltekit());
}

const config: UserConfig = {
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
};

if (isWeb) config.base = '/svelte-simple-router/';

export default defineConfig(config);
