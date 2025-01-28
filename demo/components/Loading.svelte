<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { v4 as uuid } from 'uuid';

  import { Logger } from '~/utils/logger.utils.js';

  const id = uuid();
  onMount(() => {
    console.info(...Logger.colorize('green', 'Loading mounted !'), id);
  });

  onDestroy(() => {
    console.info(...Logger.colorize('orange', 'Loading destroyed !'), id);
  });
</script>

<h4>Loading ...</h4>
