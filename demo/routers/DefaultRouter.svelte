<script lang="ts">
  import { NeoButton, NeoCard, NeoCheckbox } from '@dvcol/neo-svelte';
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

  let resolve = $state(false);
  let stripQuery = $state(false);
  let stripHash = $state(false);
  let stripTrailingHash = $state(false);
  let updateOnRouteChange = $state(false);
  let updateOnPropsChange = $state(false);
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

{#snippet transitionOptions()}
  <NeoCard rounded>
    <div class="container column" style="align-items: unset">
      <div class="row update">
        <NeoCheckbox label="Update transition on any route change" rounded bind:checked={updateOnRouteChange} />
      </div>
      <div class="row update">
        <NeoCheckbox label="Update transition on any prop change" rounded bind:checked={updateOnPropsChange} />
      </div>
      <div class="row update">
        <NeoCheckbox label="Enable default routing snippet" rounded bind:checked={routingSnippet} />
      </div>
      <div class="row update">
        <NeoCheckbox label="Enable default loading snippet" rounded bind:checked={loadingSnippet} />
      </div>
      <div class="row update">
        <NeoCheckbox label="Enable default error snippet" rounded bind:checked={errorSnippet} />
      </div>
      <div class="row update">
        <NeoCheckbox label="Route View Component" rounded bind:checked={routeView} />
      </div>
    </div>
  </NeoCard>
{/snippet}

{#if mounted}
  <h1>Simple Router</h1>
  <div class="container row">
    <div class="column">
      <OptionSelector bind:options bind:stripQuery bind:stripHash bind:stripTrailingHash bind:resolve />
      <NeoButton onclick={refresh}>Refresh router</NeoButton>
      {@render transitionOptions()}
    </div>
    <RouterView
      {options}
      transition={{
        ...transition,
        updateOnRouteChange,
        updateOnPropsChange,
        props: {
          container: {
            class: 'router-content',
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
        <PathSelector {resolve} {stripQuery} {stripHash} {stripTrailingHash} />
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
    --neo-btn-margin: 0.125rem;

    padding: 0 1rem 1rem;
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
