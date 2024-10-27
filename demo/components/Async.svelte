<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { Logger } from '~/utils/logger.utils.js';

  const uuid = crypto.randomUUID();

  onMount(() => {
    console.info(...Logger.colorize('green', 'Async mounted !'), uuid);
  });

  onDestroy(() => {
    console.info(...Logger.colorize('orange', 'Async destroyed !'), uuid);
  });
</script>

<h1>Async !</h1>
