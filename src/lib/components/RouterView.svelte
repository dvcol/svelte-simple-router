<script lang="ts">
  import RouteContainer from '~/components/RouteContainer.svelte';
  import RouterContext from '~/components/RouterContext.svelte';
  import { type IRouter, type RouterViewProps } from '~/models/router.model.js';

  import { getRouter, setView } from '~/router/context.svelte.js';

  const { children: outerChildren, options, router, name, ..._props }: RouterViewProps = $props();
  const contextRouter = getRouter();

  if (name) setView(name);
</script>

{#snippet view(_router: IRouter)}
  {@render outerChildren?.(_router)}
  <RouteContainer {name} {..._props} />
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
