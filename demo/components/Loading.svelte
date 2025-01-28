<script lang="ts">
  import { getUUID } from '@dvcol/common-utils/common/string';
  import { onDestroy, onMount } from 'svelte';

  import { Logger } from '~/utils/logger.utils.js';

  const id = getUUID();

  onMount(() => {
    console.info(...Logger.colorize('green', 'Loading mounted !'), id);
  });

  onDestroy(() => {
    console.info(...Logger.colorize('orange', 'Loading destroyed !'), id);
  });
</script>

<h4>Loading ...</h4>
