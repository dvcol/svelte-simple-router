<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  const { title, subtitle, onMoutHook }: { title?: string; subtitle?: string; onMoutHook?: () => void } = $props();

  const uuid = crypto.randomUUID();

  onMount(() => {
    if (onMoutHook) onMoutHook();
    console.info('Goodbye mounted !', uuid);
  });

  onDestroy(() => {
    console.info('Goodbye destroyed !', uuid);
  });
</script>

<h1>Goodbye !</h1>
{#if title}
  <h2>{title}</h2>
{/if}
{#if subtitle}
  <h3>{subtitle}</h3>
{/if}
