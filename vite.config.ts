import type { PluginOption } from 'vite';
import type { ViteUserConfig } from 'vitest/config';

import { fileURLToPath, URL } from 'node:url';

import { sveltekit } from '@sveltejs/kit/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { sveltePreprocess } from 'svelte-preprocess';
import { checker } from 'vite-plugin-checker';
import { defineConfig } from 'vitest/config';

const plugins: PluginOption[] = [];
const isTest = process.env.NODE_ENV === 'test';
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

if (isTest) {
  plugins.push(svelteTesting());
}

const config: ViteUserConfig = {
  plugins,
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src/lib', import.meta.url)),
    },
  },
  server: {
    port: 3303,
    open: '/svelte-simple-router/',
  },
  preview: {
    port: 3304,
    open: '/svelte-simple-router/',
  },
  test: {
    include: ['test/**/*.{test,spec}.{js,ts}'],
    exclude: ['test/setup.test.ts'],
    environment: 'jsdom',
    setupFiles: ['/test/setup.test.ts'],
    typecheck: {
      tsconfig: 'tsconfig.vite.json',
    },
    alias: {
      '~/': fileURLToPath(new URL('./src/lib', import.meta.url)),
    },
  },
};

if (isWeb) config.base = '/svelte-simple-router/';

export default defineConfig(config);
