import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['lib', '!lib/**/*.test.ts', '!lib/**/*.spec.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  splitting: true,
  sourcemap: false,
});
