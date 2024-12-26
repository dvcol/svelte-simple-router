<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { v4 as uuidv4 } from 'uuid';

  import { Logger } from '~/utils/logger.utils.js';

  const uuid = uuidv4();
  onMount(() => {
    console.info(...Logger.colorize('green', 'Loading mounted !'), uuid);
  });

  onDestroy(() => {
    console.info(...Logger.colorize('orange', 'Loading destroyed !'), uuid);
  });
</script>

<h4>Loading ...</h4>
