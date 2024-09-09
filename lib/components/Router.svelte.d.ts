import type { Component } from 'svelte';

export type RouterProps = {
  input: string;
};

export type Router = Component<RouterProps>;

export default Router;
