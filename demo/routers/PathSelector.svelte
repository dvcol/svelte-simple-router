<script lang="ts">
  import type { Route, RouteName } from '~/models/route.model.js';

  import { NeoButton, NeoCard, NeoInput } from '@dvcol/neo-svelte';

  import { active } from '~/action/active.action.svelte.js';
  import { link } from '~/action/link.action.svelte.js';
  import { links } from '~/action/links.action.svelte.js';
  import { NavigationCancelledError } from '~/models/error.model.js';
  import { useNavigate, useRouter } from '~/router/hooks.svelte.js';

  const {
    resolve = false,
    stripQuery,
    stripHash,
    stripTrailingHash,
  }: { resolve?: boolean; stripQuery?: boolean; stripHash?: boolean; stripTrailingHash?: boolean } = $props();

  const navOptions = $derived({
    resolve,
    stripQuery: stripQuery ? true : undefined,
    stripHash: stripHash ? true : undefined,
    stripTrailingHash: stripTrailingHash ? true : undefined,
  });

  const router = useRouter();

  const routes: Route[] = $derived([...(router?.routes ?? [])].sort((a, b) => a.name?.localeCompare(b.name)));

  const { push } = useNavigate();

  const onRouterButton = async (e: MouseEvent, path: string) => {
    console.info('onRouterButton', path);
    e.preventDefault();
    try {
      const route = await push({ path, ...navOptions });
      console.info('Route', route);
    } catch (err: any) {
      console.error(err, err?.from, err?.to);
    }
  };

  const route = $state({ name: 'dynamic', path: '/dynamic', redirect: { name: 'goodbye' } });

  const handleError = (err: Error | unknown) => {
    if (err instanceof NavigationCancelledError) {
      console.warn('[PathSelector]', 'Failed to sync, navigation cancelled', err);
    } else {
      console.error('[PathSelector]', 'Failed to sync', err);
    }
  };

  const onAddRoute = async () => {
    if (!router) return console.error('Router not found');
    console.info('onAddRoute', route);
    try {
      await router.addRoute(route).sync();
    } catch (err) {
      handleError(err);
    }
    console.info('New routes', router.routes);
  };
  const onRemoveRoute = async (e: MouseEvent, name?: RouteName) => {
    if (!router) return console.error('Router not found');
    console.info('onRemoveRoute', route);
    e.preventDefault();
    if (!router.removeRoute({ name })) return;
    try {
      await router.sync();
    } catch (err) {
      handleError(err);
    }
    console.info('New routes', router.routes);
  };
</script>

<NeoCard rounded>
  <div id="route-selector" class="container">
    <h4>Routes</h4>
    <table class="routes" use:links>
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
        {#each routes as { name, path, redirect, meta } (name ?? path)}
          <tr use:link={{ name, path, ...navOptions }} use:active={{ name, path, class: 'active', exact: true }}>
            <td>{name}</td>
            <td>{path}</td>
            <td>{redirect?.name ?? redirect?.path ?? meta?.redirect ?? '-'}</td>
            <td><NeoButton elevation="2" hover="-1" active="-1" onclick={e => onRouterButton(e, path)}>Go</NeoButton></td>
            <td><NeoButton elevation="2" hover="-1" active="-1" onclick={e => onRemoveRoute(e, name)}>Remove</NeoButton></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#snippet footer()}
    <div class="row add">
      <label for="route">Add Route</label>
      <NeoInput elevation={0} rounded id="route" bind:value={route.name} />
      <NeoInput elevation={0} rounded id="route.path" bind:value={route.path} />
      <NeoInput elevation={0} rounded id="route.redirect.name" bind:value={route.redirect.name} />
      <NeoButton onclick={() => onAddRoute()}>Add</NeoButton>
    </div>
  {/snippet}

  {#snippet action()}
    <div class="row">
      <NeoButton borderless onclick={async () => router?.back()}>Back</NeoButton>
      <NeoButton borderless onclick={() => router?.forward()}>Forward</NeoButton>
    </div>
  {/snippet}
</NeoCard>

<style lang="scss">
  .row {
    display: flex;
    flex: 1 1 auto;
    flex-direction: row;
    gap: 1rem;
    align-items: baseline;
    justify-content: center;
  }

  .add {
    padding: 0.5rem;
  }

  :global(.active) {
    color: orangered;
  }

  .routes {
    padding: 1rem;
    border-radius: 0.5rem;
  }

  tbody tr {
    cursor: pointer;

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
  }
</style>
