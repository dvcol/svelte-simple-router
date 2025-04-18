import { defineSvelteConfig } from '@dvcol/eslint-config';

export default defineSvelteConfig({
  ignores: [
    '.github/copilot-instructions.md',
    'README.md',
  ],
});
