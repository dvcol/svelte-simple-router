<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { LifeCycle } from './mocks.js';

  const {
    error,
    onMounted = LifeCycle.Error.onMounted,
    onDestroyed = LifeCycle.Error.onDestroyed,
  }: { error: Error | any; onMounted: () => unknown; onDestroyed: () => unknown } = $props();

  onMount(onMounted);
  onDestroy(onDestroyed);
</script>

<div data-testid="error-component">
  <h1>Error Component</h1>
  {#if error}
    <p data-testid="error-message">{error?.message ?? error}</p>
  {/if}
</div>
