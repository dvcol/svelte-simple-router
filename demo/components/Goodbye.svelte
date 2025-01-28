<script lang="ts">
  import { getUUID } from '@dvcol/common-utils/common/string';
  import { onDestroy, onMount } from 'svelte';

  import { Logger } from '~/utils/logger.utils.js';

  const { title, subtitle, onMoutHook }: { title?: string; subtitle?: string; onMoutHook?: () => void } = $props();

  const id = getUUID();

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
