<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { Logger } from '~/utils/logger.utils.js';

  const uuid = crypto.randomUUID();
  onMount(() => {
    console.info(...Logger.colorize('green', 'Loading mounted !'), uuid);
  });

  onDestroy(() => {
    console.info(...Logger.colorize('orange', 'Loading destroyed !'), uuid);
  });
</script>

<h4>Loading ...</h4>
