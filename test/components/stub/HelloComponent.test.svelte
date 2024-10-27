<script lang="ts">
  import { useRouter } from '~/router/hooks.svelte.js';

  const { title, children }: { title: string } = $props();

  const router = useRouter();

  const meta: string | undefined = $derived(router?.route?.meta?.key);
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
