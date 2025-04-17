<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { PartialRoute, Route } from '~/models/route.model.js';

  import RouteView from '~/components/RouteView.svelte';

  const { children, uuid, ..._props }: { children?: Snippet; uuid?: string } & Record<string, Route['component']> = $props();

  const name = `RouteView${uuid ? `-${uuid}` : ''}`;

  const route: PartialRoute = {
    name,
    path: `/route-view${uuid ? `/${uuid}` : ''}`,
    props: {
      title: name,
    },
    meta: {
      title: 'Params',
    },
    params: {
      date: new Date().toISOString(),
    },
    query: {
      type: 'dynamic',
    },
    beforeEnter: () => {
      console.info(`Before enter ${name}`);
    },
    beforeLeave: () => {
      console.info(`Before leave ${name}`);
    },
  };
</script>

<RouteView {route} {..._props}>
  <h1>RouteView</h1>
  <p>Children injected into RouteView</p>
  {@render children?.()}

  {#snippet loading()}
    <div class="column">
      <p>Default Loading...</p>
    </div>
  {/snippet}

  {#snippet error(err: Error)}
    <h1>Default Error</h1>
    <p class="error">Default Error {err}</p>
  {/snippet}
</RouteView>
