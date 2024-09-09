import { resolve } from 'path';
import { fileURLToPath, URL } from 'url';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import { sveltePreprocess } from 'svelte-preprocess';

import { defineConfig } from 'vite';
import { checker } from 'vite-plugin-checker';
import dtsPlugin from 'vite-plugin-dts';

import type { PluginOption } from 'vite';

const plugins: PluginOption[] = [
  svelte({
    preprocess: sveltePreprocess({
      typescript: true,
    }),
    emitCss: false,
  }),
];

if (process.env.NODE_ENV === 'development') {
  plugins.push(
    checker({
      typescript: {
        tsconfigPath: 'tsconfig.json',
      },
    }),
  );
} else {
  plugins.push(dtsPlugin());
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins,
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./lib', import.meta.url)),
    },
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    minify: true,
    target: 'esnext',
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      formats: ['es', 'cjs'],
      name: 'svelte-simple-router',
      fileName: (format, fileName) => `${fileName}.${format === 'es' ? 'js' : format}`,
    },
    rollupOptions: {
      external: ['svelte'],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'lib',
        globals: {
          svelte: 'svelte',
        },
      },
    },
  },
});
