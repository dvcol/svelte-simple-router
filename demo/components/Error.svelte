<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { v4 as uuid } from 'uuid';

  import { Logger } from '~/utils/logger.utils.js';

  const { error }: { error: Error | any } = $props();

  const id = uuid();
  onMount(() => {
    console.info(...Logger.colorize('green', 'Error mounted !'), id);
  });

  onDestroy(() => {
    console.info(...Logger.colorize('orange', 'Error destroyed !'), id);
  });
</script>

<div>
  <h1>Custom Error</h1>
  <p class="error">{error?.message ?? error}</p>
  {#if error?.stack}
    <p class="error">{error.stack}</p>
  {/if}
</div>

<style>
  .error {
    max-width: 30rem;
    color: red;
  }
</style>
