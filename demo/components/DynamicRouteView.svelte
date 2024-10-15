<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { PartialRoute } from '~/models/route.model.js';

  import RouteView from '~/components/RouteView.svelte';

  const { children }: { children?: Snippet } = $props();

  const name = 'RouteView';

  const route: PartialRoute = {
    name,
    path: '/route-view',
    props: {
      title: name,
    },
    meta: {
      title: 'Params',
    },
    params: {
      get date() {
        return new Date().toISOString();
      },
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

<RouteView {route}>
  <h1>RouteView</h1>
  <p>Children injected into RouteView</p>
  {@render children?.()}

  {#snippet loading()}
    <div class="column">
      <p>Default Loading...</p>
    </div>
  {/snippet}

  {#snippet error(err)}
    <h1>Default Error</h1>
    <p class="error">Default Error {err}</p>
  {/snippet}
</RouteView>
