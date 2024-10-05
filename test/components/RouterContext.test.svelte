<script lang="ts">
  import type { RouterViewProps } from '~/models/router.model.js';

  import RouterContext from '~/components/RouterContext.svelte';
  import RouterView from '~/components/RouterView.svelte';

  const { options, router, transition }: RouterViewProps = $props();
</script>

<RouterContext {options} {router}>
  <RouterView {transition}>
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
  </RouterView>
  <RouterView name="nested">
    {#snippet loading()}
      <div data-testid="default-loading-nested"><h1>Default Loading</h1></div>
    {/snippet}
    {#snippet error(_error)}
      <div data-testid="default-error-nested">
        <h1>Default Error</h1>
        {#if _error}
          <p data-testid="error-message-nested">{_error?.message ?? _error}</p>
        {/if}
      </div>
    {/snippet}
  </RouterView>
</RouterContext>
