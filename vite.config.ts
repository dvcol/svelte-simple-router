import { fileURLToPath, URL } from 'url';

import { sveltekit } from '@sveltejs/kit/vite';

import { checker } from 'vite-plugin-checker';
import { defineConfig } from 'vitest/config';

import type { PluginOption } from 'vite';

const plugins: PluginOption[] = [sveltekit()];

if (process.env.NODE_ENV === 'development') {
  plugins.push(
    checker({
      typescript: {
        tsconfigPath: 'tsconfig.json',
      },
    }),
  );
}

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./lib', import.meta.url)),
    },
  },
  test: {
    include: ['**/*.{test,spec}.{js,ts}'],
    alias: {
      '~/': fileURLToPath(new URL('./lib', import.meta.url)),
    },
  },
});
