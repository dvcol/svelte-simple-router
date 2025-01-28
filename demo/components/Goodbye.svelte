<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { v4 as uuid } from 'uuid';

  import { Logger } from '~/utils/logger.utils.js';

  const { title, subtitle, onMoutHook }: { title?: string; subtitle?: string; onMoutHook?: () => void } = $props();

  const id = uuid();
  onMount(() => {
    onMoutHook?.();
    console.info(...Logger.colorize('green', 'Goodbye mounted !'), id);
  });

  onDestroy(() => {
    console.info(...Logger.colorize('orange', 'Goodbye destroyed !'), id);
  });
</script>

<h1>Goodbye !</h1>
{#if title}
  <h4>{title}</h4>
{/if}
{#if subtitle}
  <h5>{subtitle}</h5>
{/if}
