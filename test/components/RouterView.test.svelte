<script lang="ts">
  import type { RouterViewProps } from '~/models/router.model.js';

  import RouterView from '~/components/RouterView.svelte';

  const { options, router, onError, onEnd, onStart, beforeEach, onLoading, onLoaded, transition }: RouterViewProps = $props();
</script>

<RouterView {options} {router} {onError} {onEnd} {onStart} {beforeEach} {onLoading} {onLoaded} {transition}>
  {#snippet loading()}
    <div data-testid="default-loading"><h1>Default Loading</h1></div>
  {/snippet}
  {#snippet error(_error)}
    <div data-testid="default-error">
      <h1>Default Error</h1>
      {#if _error}
        <p data-testid="error-message">{_error?.message ?? _error}</p>
      {/if}
    </div>
  {/snippet}
  {#snippet routing(_router)}
    <div data-testid="default-routing">
      <h1>Default Routing</h1>
      <span data-testid="routing-from">{_router?.routing?.from?.location?.name}</span>
      <span data-testid="routing-to">{_router?.routing?.to?.name}</span>
    </div>
  {/snippet}
</RouterView>
