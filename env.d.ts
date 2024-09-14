/// <reference types="svelte" />
/// <reference types="vite/client" />
/// <reference types="navigation-api-types" />

declare global {
  interface ImportMeta {
    env: {
      VITE_MODE?: 'WEB';
    };
  }
}
