<script lang="ts">
  import type { Snippet } from 'svelte';

  import { onDestroy, onMount } from 'svelte';

  import { useRouter } from '~/router/hooks.svelte.js';

  import { LifeCycle } from './mocks.js';

  const {
    title,
    children,
    onMounted = LifeCycle.Hello.onMounted,
    onDestroyed = LifeCycle.Hello.onDestroyed,
  }: { title: string; children: Snippet; onMounted: () => unknown; onDestroyed: () => unknown } = $props();

  const router = useRouter();

  const meta: string | undefined = $derived(router?.route?.meta?.key);

  onMount(onMounted);
  onDestroy(onDestroyed);
</script>

<div data-testid="hello-component">
  <h1>Hello</h1>
  {#if title}
    <h2 data-testid="title">{title}</h2>
  {/if}
  {#if meta}
    <h2 data-testid="meta">{meta}</h2>
  {/if}
</div>

{@render children?.()}
