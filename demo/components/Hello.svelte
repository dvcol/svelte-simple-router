<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { Logger } from '~/utils/logger.utils.js';

  const { title, subtitle, onMoutHook }: { title?: string; subtitle?: string; onMoutHook?: () => void } = $props();

  const uuid = crypto.randomUUID();

  onMount(() => {
    onMoutHook?.();
    console.info(...Logger.colorize('green', 'Hello mounted !'), uuid);
  });

  onDestroy(() => {
    console.info(...Logger.colorize('orange', 'Hello destroyed !'), uuid);
  });
</script>

<h1>Hello !</h1>
{#if title}
  <h4>{title}</h4>
{/if}
{#if subtitle}
  <h5>{subtitle}</h5>
{/if}
