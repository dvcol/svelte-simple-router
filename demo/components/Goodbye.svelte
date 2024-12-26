<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { v4 as uuidv4 } from 'uuid';

  import { Logger } from '~/utils/logger.utils.js';

  const { title, subtitle, onMoutHook }: { title?: string; subtitle?: string; onMoutHook?: () => void } = $props();

  const uuid = uuidv4();
  onMount(() => {
    onMoutHook?.();
    console.info(...Logger.colorize('green', 'Goodbye mounted !'), uuid);
  });

  onDestroy(() => {
    console.info(...Logger.colorize('orange', 'Goodbye destroyed !'), uuid);
  });
</script>

<h1>Goodbye !</h1>
{#if title}
  <h2>{title}</h2>
{/if}
{#if subtitle}
  <h3>{subtitle}</h3>
{/if}
