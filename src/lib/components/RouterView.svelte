<script lang="ts">
  import type { RouterViewProps } from '~/models/component.model.js';

  import RouteContainer from '~/components/RouteContainer.svelte';
  import RouterContext from '~/components/RouterContext.svelte';
  import { type IRouter } from '~/models/router.model.js';

  import { getRouter } from '~/router/context.svelte.js';

  const { options, router, ..._props }: RouterViewProps = $props();

  const contextRouter = getRouter();
</script>

{#snippet container(_router: IRouter)}
  <RouteContainer {..._props} />
{/snippet}

{#if contextRouter}
  {@render container(contextRouter)}
{:else}
  <RouterContext {options} {router} children={container} />
{/if}
