<script lang="ts">
  import type { IRouter, RouterViewProps } from '~/models/router.model.js';

  import RouteContainer from '~/components/RouteContainer.svelte';
  import RouterContext from '~/components/RouterContext.svelte';
  import { useRouter } from '~/router/use-router.svelte.js';

  const { children: outerChildren, options, router, ..._props }: RouterViewProps = $props();
  const contextRouter = useRouter();
</script>

{#snippet view(_router: IRouter)}
  {@render outerChildren?.(router)}
  <RouteContainer {..._props} />
{/snippet}

{#if contextRouter}
  {@render view(contextRouter)}
{:else}
  <RouterContext {options} {router}>
    {#snippet children(_router)}
      {@render view(_router)}
    {/snippet}
  </RouterContext>
{/if}
