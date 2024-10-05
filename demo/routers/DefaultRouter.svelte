<script lang="ts">
  import { tick } from 'svelte';

  import OptionSelector from './OptionSelector.svelte';
  import PathSelector from './PathSelector.svelte';

  import type { RouterOptions } from '~/models/router.model.js';

  import RouterView from '~/components/RouterView.svelte';
  import RouteDebugger from '~/components/debug/RouteDebugger.svelte';
  import RouterDebugger from '~/components/debug/RouterDebugger.svelte';
  import { transition } from '~/utils/transition.utils.js';

  const opts: Partial<RouterOptions> = $props();

  let options: RouterOptions = $state({
    listen: 'navigation',
    base: '/svelte-simple-router',
    hash: true,
    strict: false,
    failOnNotFound: false,
    metaAsState: false,
    nameAsTitle: false,
    followGuardRedirects: true,
    caseSensitive: false,
    ...opts,
  });

  let stripQuery = $state(false);
  let stripHash = $state(false);
  let stripTrailingHash = $state(false);
  let updateOnRouteChange = $state(false);

  let mounted = $state(true);
  const refresh = async () => {
    mounted = false;
    await tick();
    mounted = true;
  };
</script>

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
    >
      <div class="column selector">
        <PathSelector {stripQuery} {stripHash} {stripTrailingHash} />
        <div class="row update">
          <label for="update-on-route-change">Update transition on any route change</label>
          <input id="update-on-route-change" type="checkbox" bind:checked={updateOnRouteChange} />
        </div>
      </div>

      <div class="column debuggers">
        <RouterDebugger />
        <RouteDebugger />
      </div>

      {#snippet loading()}
        <p>Default Loading...</p>
      {/snippet}

      {#snippet error(err)}
        <h1>Default Error</h1>
        <p class="error">Default Error: {err}</p>
      {/snippet}
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
    color: orangered;
  }
</style>
