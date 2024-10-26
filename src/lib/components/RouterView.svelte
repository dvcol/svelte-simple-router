<script lang="ts">
  import { onDestroy } from 'svelte';

  import RouteContainer from '~/components/RouteContainer.svelte';
  import RouterContext from '~/components/RouterContext.svelte';
  import { type IRouter, type RouterViewProps } from '~/models/router.model.js';

  import { getRouter, setView } from '~/router/context.svelte.js';
  import { View } from '~/router/view.svelte.js';

  const { children: outerChildren, options, router, name, onLoaded, onLoading, onError, ..._props }: RouterViewProps = $props();
  const contextRouter = getRouter();

  const view = new View(name);
  setView(view);

  const subs: (() => void)[] = [];

  if (onLoading) subs.push(view.onLoading(onLoading));
  if (onLoaded) subs.push(view.onLoaded(onLoaded));
  if (onError) subs.push(view.onError(onError));

  onDestroy(() => subs.forEach(sub => sub()));
</script>

{#snippet container(_router: IRouter)}
  {@render outerChildren?.(_router)}
  <RouteContainer {name} {view} {onError} {..._props} />
{/snippet}

{#if contextRouter}
  {@render container(contextRouter)}
{:else}
  <RouterContext {options} {router}>
    {#snippet children(_router)}
      {@render container(_router)}
    {/snippet}
  </RouterContext>
{/if}
