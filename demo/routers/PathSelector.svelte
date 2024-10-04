<script lang="ts">
  import type { Route } from '~/models/route.model.js';

  import { active } from '~/router/active.svelte';
  import { link } from '~/router/link.svelte';
  import { useRouter } from '~/router/use-router.svelte';
  import { Logger } from '~/utils/logger.utils.js';

  const { stripQuery, stripHash, stripTrailingHash }: { stripQuery?: boolean; stripHash?: boolean; stripTrailingHash?: boolean } = $props();

  const router = useRouter();

  const routes: Route[] = $derived(router?.routes ?? []);

  const onRouterButton = async (path: string) => {
    console.info('onRouterButton', path);
    if (!router) return Logger.error('Router not found');
    try {
      const route = await router.push({ path, stripQuery, stripHash, stripTrailingHash });
      console.info('Route', route);
    } catch (err: any) {
      console.error(err, err?.from, err?.to);
    }
  };

  const route = $state({ name: 'dynamic', path: '/dynamic', redirect: { name: 'goodbye' } });
  const onAddRoute = async () => {
    if (!router) return Logger.error('Router not found');
    console.info('onAddRoute', route);
    await router.addRoute(route).sync();
    console.info('New routes', router.routes);
  };
  const onRemoveRoute = async (name: string) => {
    if (!router) return Logger.error('Router not found');
    console.info('onRemoveRoute', route);
    if (!router.removeRoute({ name })) return;
    await router.sync();
    console.info('New routes', router.routes);
  };
</script>

<div id="route-selector" class="container">
  <h3>Routes</h3>
  <table class="routes">
    <thead>
      <tr>
        <th>Name</th>
        <th>Path</th>
        <th>Redirect</th>
        <th>Go</th>
        <th>Remove</th>
      </tr>
    </thead>
    <tbody>
      {#each routes as { name, path, redirect, meta }}
        <tr use:link={{ name, stripHash, stripTrailingHash, stripQuery }} use:active={{ name, class: 'active', exact: true }}>
          <td>{name}</td>
          <td>{path}</td>
          <td>{redirect?.name ?? redirect?.path ?? meta?.redirect ?? '-'}</td>
          <td><button onclick={() => onRouterButton(path)}>Go</button></td>
          <td><button onclick={() => onRemoveRoute(name)}>Remove</button></td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<div class="row add">
  <label for="route">Add Route</label>
  <input id="route" type="text" bind:value={route.name} />
  <input id="route.path" type="text" bind:value={route.path} />
  <input id="route.redirect.name" type="text" bind:value={route.redirect.name} />
  <button onclick={() => onAddRoute()}>Add</button>
</div>

<div class="row">
  <button onclick={async () => router.back()}>Back</button>
  <button onclick={() => router.forward()}>Forward</button>
</div>

<style lang="scss">
  .row {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    align-items: baseline;
    justify-content: center;
  }

  .add {
    padding: 0.5rem;
  }

  // stylelint-disable-next-line selector-pseudo-class-no-unknown
  :global(.active) {
    color: red;
  }

  .routes {
    padding: 1rem;
    background-color: color-mix(in srgb, transparent, black 20%);
    border-radius: 0.5rem;
  }

  tbody tr {
    cursor: pointer;
    transition: background-color 300ms ease;

    td {
      padding: 0.5rem 0.75rem;

      &:first-child {
        border-top-left-radius: 0.5rem;
        border-bottom-left-radius: 0.5rem;
      }

      &:last-child {
        border-top-right-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
      }
    }

    &:active,
    &:hover {
      background-color: color-mix(in srgb, transparent, black 40%);
    }
  }
</style>
