<script lang="ts">
  import { tick } from 'svelte';

  import DynamicRouteView from '../components/DynamicRouteView.svelte';

  import OptionSelector from './OptionSelector.svelte';
  import PathSelector from './PathSelector.svelte';

  import type { IRouter, RouterOptions } from '~/models/router.model.js';

  import RouterView from '~/components/RouterView.svelte';
  import RouteDebugger from '~/components/debug/RouteDebugger.svelte';
  import RouterDebugger from '~/components/debug/RouterDebugger.svelte';
  import ViewDebugger from '~/components/debug/ViewDebugger.svelte';
  import { defaultOptions } from '~/models/router.model.js';
  import { transition } from '~/utils/transition.utils.js';

  const opts: Partial<RouterOptions> = $props();

  let options: RouterOptions = $state({
    ...defaultOptions,
    listen: 'navigation',
    base: '/svelte-simple-router',
    hash: true,
    ...opts,
  });

  let stripQuery = $state(false);
  let stripHash = $state(false);
  let stripTrailingHash = $state(false);
  let updateOnRouteChange = $state(false);
  let routingSnippet = $state(false);
  let loadingSnippet = $state(true);
  let errorSnippet = $state(true);
  let routeView = $state(true);

  let mounted = $state(true);
  const refresh = async () => {
    mounted = false;
    await tick();
    mounted = true;
  };
</script>

{#snippet routing(_routing: IRouter['routing'])}
  <div class="column">
    <p>Routing ...</p>
    <p>
      from <span class="routing">{_routing?.from?.location?.name ?? '-'}</span> to
      <span class="routing">{_routing?.to?.name ?? '-'}</span>
    </p>
  </div>
{/snippet}

{#snippet loading()}
  <div class="column">
    <p>Default Loading...</p>
  </div>
{/snippet}

{#snippet error(err: unknown)}
  <h1>Default Error</h1>
  <p class="error">Default Error: {err}</p>
{/snippet}

{#if mounted}
  <h1>Simple Router</h1>
  <div class="container row">
    <div class="column">
      <OptionSelector bind:options bind:stripQuery bind:stripHash bind:stripTrailingHash />
      <button onclick={refresh}>Refresh router</button>
    </div>
    <RouterView
      {options}
      transition={{
        ...transition,
        updateOnRouteChange,
        props: {
          container: {
            class: 'content',
          },
        },
      }}
      routing={routingSnippet ? routing : undefined}
      loading={loadingSnippet ? loading : undefined}
      error={errorSnippet ? error : undefined}
    >
      {#if routeView}
        <DynamicRouteView />
      {/if}
      <div class="column selector">
        <PathSelector {stripQuery} {stripHash} {stripTrailingHash} />
        <div class="row update">
          <label for="update-on-route-change">Update transition on any route change</label>
          <input id="update-on-route-change" type="checkbox" bind:checked={updateOnRouteChange} />
        </div>
        <div class="row update">
          <label for="routing-snippet">Enable default routing snippet</label>
          <input id="routing-snippet" type="checkbox" bind:checked={routingSnippet} />
        </div>
        <div class="row update">
          <label for="loading-snippet">Enable default loading snippet</label>
          <input id="loading-snippet" type="checkbox" bind:checked={loadingSnippet} />
        </div>
        <div class="row update">
          <label for="error-snippet">Enable default error snippet</label>
          <input id="error-snippet" type="checkbox" bind:checked={errorSnippet} />
        </div>
        <div class="row update">
          <label for="routeView">Route View Component</label>
          <input id="routeView" type="checkbox" bind:checked={routeView} />
        </div>
      </div>

      <div class="column debuggers">
        <RouterDebugger />
        <RouteDebugger />
        <ViewDebugger />
      </div>
    </RouterView>
  </div>
{/if}

<style lang="scss">
  .container {
    padding: 0 1rem 1rem;
    background-color: rgba(0 0 0 / 20%);
    border-radius: 0.5rem;
  }

  .row {
    display: flex;
    flex: 1 1 auto;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .update {
    padding: 0 1rem;
  }

  .column {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    margin: auto;
    padding: 1rem;
    border-radius: 0.5rem;
  }

  .selector {
    flex: 1 1 40rem;
  }

  .debuggers {
    flex: 1 1 20rem;
  }

  .error {
    max-width: 30rem;
    color: red;
  }

  .routing {
    color: orangered;
  }
</style>
