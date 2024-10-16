<script lang="ts">
  import type { IRouter, RouterViewProps } from '~/models/router.model.js';

  import RouterContext from '~/components/RouterContext.svelte';
  import RouterView from '~/components/RouterView.svelte';

  const { options, router, transition }: RouterViewProps = $props();
</script>

{#snippet loading()}
  <div data-testid="default-loading"><h1>Default Loading</h1></div>
{/snippet}
{#snippet error(_error: Error)}
  <div data-testid="default-error">
    <h1>Default Error</h1>
    {#if _error}
      <p data-testid="error-message">{_error?.message ?? _error}</p>
    {/if}
  </div>
{/snippet}
{#snippet routing(_routing: IRouter['routing'])}
  <div data-testid="default-routing">
    <h1>Default Routing</h1>
    <span data-testid="routing-from">{_routing?.from?.location?.name}</span>
    <span data-testid="routing-to">{_routing?.to?.name}</span>
  </div>
{/snippet}

<RouterContext {options} {router}>
  <RouterView {transition} {loading} {error} {routing} />
  <RouterView {loading} {error} name="nested" />
</RouterContext>
