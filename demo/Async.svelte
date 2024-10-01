<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  const uuid = crypto.randomUUID();
  onMount(() => {
    console.info('Async mounted !', uuid);
  });

  onDestroy(() => {
    console.info('Async destroyed !', uuid);
  });
</script>

<h1>Async !</h1>
