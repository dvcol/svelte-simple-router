<script lang="ts">
  import type { IRouter } from '~/models/router.model.js';

  import RouterView from '~/components/RouterView.svelte';
  import { links } from '~/router/links.svelte';

  const { router }: { router: IRouter } = $props();
</script>

<RouterView {router}>
  <div data-testid="default" use:links>
    <a data-testid="anchor-path" href="/home">path</a>

    <span data-testid="span-path" data-router-link data-path="/home">path</span>
    <span data-testid="span-name" data-router-link data-name="home">name</span>

    <div data-testid="nested">
      <a data-testid="nested-anchor-path" href="/home">path</a>
      <span data-testid="nested-span-path" data-router-link data-path="/home">path</span>
      <span data-testid="nested-span-name" data-router-link data-name="home">name</span>
    </div>
  </div>

  <div data-testid="navigate" use:links={{ navigate: { replace: true } }}>
    <a data-testid="navigate-anchor-path" href="/home">path</a>

    <span data-testid="navigate-span-path" data-router-link data-path="/home">path</span>
    <span data-testid="navigate-span-name" data-router-link data-name="home">name</span>

    <div data-testid="nested">
      <a data-testid="navigate-nested-anchor-path" href="/home">path</a>
      <span data-testid="navigate-nested-span-path" data-router-link data-path="/home">path</span>
      <span data-testid="navigate-nested-span-name" data-router-link data-name="home">name</span>
    </div>
  </div>

  <div data-testid="apply" use:links={{ apply: (node: HTMLElement) => node.dataset.path || node.dataset.name }}>
    <a data-testid="apply-anchor-path" href="/home">path</a>

    <span data-testid="apply-span-path" data-path="/home">path</span>
    <span data-testid="apply-span-name" data-name="home">name</span>

    <div data-testid="apply-nested">
      <a data-testid="apply-nested-anchor-path" href="/home">path</a>
      <span data-testid="apply-nested-span-path" data-path="/home">path</span>
      <span data-testid="apply-nested-span-name" data-name="home">name</span>
    </div>
  </div>

  <div data-testid="outside-boundary" data-router-link data-name="home">
    <div data-testid="boundary" use:links={{ boundary: (node: HTMLElement) => node.dataset.testid === 'boundary-nested' }}>
      <a data-testid="boundary-anchor-path" href="/home">path</a>

      <span data-testid="boundary-span-path" data-router-link data-path="/home">path</span>
      <span data-testid="boundary-span-name" data-router-link data-name="home">name</span>

      <div data-testid="boundary-nested">
        <a data-testid="boundary-nested-anchor-path" href="/home">path</a>
        <span data-testid="boundary-nested-span-path" data-router-link data-path="/home">path</span>
        <span data-testid="boundary-nested-span-name" data-router-link data-name="home">name</span>
      </div>
    </div>
  </div>

  <a data-testid="outside-anchor-path" href="/home">path</a>
  <span data-testid="outside-span-path" data-router-link data-path="/home">path</span>
  <span data-testid="outside-span-name" data-router-link data-name="home">name</span>
</RouterView>
