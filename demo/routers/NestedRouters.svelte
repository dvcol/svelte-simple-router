<script lang="ts">
  import { tick } from 'svelte';

  import OptionSelector from './OptionSelector.svelte';
  import PathSelector from './PathSelector.svelte';

  import type { RouterOptions } from '~/models/router.model.js';

  import RouterContext from '~/components/RouterContext.svelte';
  import RouterView from '~/components/RouterView.svelte';
  import RouteDebugger from '~/components/debug/RouteDebugger.svelte';
  import RouterDebugger from '~/components/debug/RouterDebugger.svelte';
  import { defaultOptions } from '~/models/router.model.js';

  const opts: Partial<RouterOptions> = $props();

  let options: RouterOptions = $state({
    ...defaultOptions,
    listen: 'history',
    update: 'replace',
    base: '/svelte-simple-router',
    hash: true,
    beforeEach: navigation => {
      console.info('Option before each', navigation);
    },
    onStart: navigation => {
      console.info('Option on start', navigation);
    },
    onEnd: (navigation, resolved) => {
      console.info('Option on end', { navigation, resolved });
    },
    onError: (err, navigation) => {
      console.error('Option on error', { err, ...navigation });
    },
    ...opts,
  });

  let stripQuery = $state(false);
  let stripHash = $state(false);
  let stripTrailingHash = $state(false);

  let mounted = $state(true);
  const refresh = async () => {
    mounted = false;
    await tick();
    mounted = true;
  };
</script>

{#if mounted}
  <h1>Nested Router</h1>
  <div class="container row">
    <RouterContext {options}>
      <div class="column">
        <OptionSelector bind:options bind:stripQuery bind:stripHash bind:stripTrailingHash />
        <button onclick={refresh}>Refresh router</button>
      </div>

      <div class="column selector">
        <PathSelector {stripQuery} {stripHash} {stripTrailingHash} />
      </div>

      <div class="column debuggers">
        <RouterDebugger />
        <RouteDebugger />
      </div>

      <div class="content">
        <RouterView
          {options}
          onLoading={_route => console.warn('View loading', _route)}
          onLoaded={_route => console.info('View loaded', _route)}
          onError={(err, { route: _route }) => console.error('View load error', { err, route: _route })}
          onStart={navigation => console.info('View start', navigation)}
          onEnd={(navigation, resolved) => console.info('View end', { navigation, resolved })}
          beforeEach={navigation => console.info('View before each', navigation)}
        >
          <h2>View default</h2>

          {#snippet loading()}
            <p>Default Loading...</p>
          {/snippet}

          {#snippet error(err)}
            <h1>Default Error</h1>
            <p class="error">Default Error: {err}</p>
          {/snippet}
        </RouterView>

        <RouterView {options} name="Nested">
          <h2>View nested</h2>
        </RouterView>
      </div>
    </RouterContext>
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
    color: orangered;
  }
</style>
