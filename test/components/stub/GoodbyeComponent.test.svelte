<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { LifeCycle } from './mocks.js';

  import { useRouter } from '~/router/hooks.svelte.js';

  const {
    title,
    onMounted = LifeCycle.Goodbye.onMounted,
    onDestroyed = LifeCycle.Goodbye.onDestroyed,
  }: { title: string; onMounted: () => unknown; onDestroyed: () => unknown } = $props();

  const router = useRouter();

  const meta: string | undefined = $derived(router?.route?.meta?.key);

  onMount(onMounted);
  onDestroy(onDestroyed);
</script>

<div data-testid="goodbye-component">
  <h1>Goodbye</h1>
  {#if title}
    <h2 data-testid="title">{title}</h2>
  {/if}
  {#if meta}
    <h2 data-testid="meta">{meta}</h2>
  {/if}
</div>
