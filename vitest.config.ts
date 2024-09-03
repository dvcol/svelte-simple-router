import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    alias: {
      '~/': new URL('./lib/', import.meta.url).pathname,
    },
  },
});
