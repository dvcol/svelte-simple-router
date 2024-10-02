<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  const { title, subtitle, onMoutHook }: { title?: string; subtitle?: string; onMoutHook?: () => void } = $props();

  const uuid = crypto.randomUUID();

  onMount(() => {
    if (onMoutHook) onMoutHook();
    console.info('Hello mounted !', uuid);
  });

  onDestroy(() => {
    console.info('Hello destroyed !', uuid);
  });
</script>

<h1>Hello !</h1>
{#if title}
  <h2>{title}</h2>
{/if}
{#if subtitle}
  <h3>{subtitle}</h3>
{/if}
