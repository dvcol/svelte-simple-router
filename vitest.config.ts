import { fileURLToPath, URL } from 'url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    alias: {
      '~/': fileURLToPath(new URL('./lib', import.meta.url)),
    },
  },
});
