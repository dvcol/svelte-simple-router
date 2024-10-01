<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  const uuid = crypto.randomUUID();
  onMount(() => {
    console.info('Loading mounted !', uuid);
  });

  onDestroy(() => {
    console.info('Loading destroyed !', uuid);
  });
</script>

<h4>Loading ...</h4>
