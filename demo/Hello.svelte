<script lang="ts">
  import { onMount } from 'svelte';

  const { title, subtitle, onMoutHook }: { title?: string; subtitle?: string; onMoutHook?: () => void } = $props();

  onMount(() => {
    if (onMoutHook) onMoutHook();
  });
</script>

<h1>Hello !</h1>
{#if title}
  <h2>{title}</h2>
{/if}
{#if subtitle}
  <h3>{subtitle}</h3>
{/if}
