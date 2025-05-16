<script lang="ts">
  import type { RouterContextProps } from '~/models/component.model.js';
  import type { IRouter } from '~/models/router.model.js';

  import { onDestroy, onMount } from 'svelte';

  import { getRouter, setRouter } from '~/router/context.svelte.js';
  import { Logger, LoggerKey } from '~/utils/logger.utils.js';

  const { children, router, options }: RouterContextProps = $props();

  const outerRouter = getRouter();

  if (outerRouter && (router || options)) {
    Logger.warn(`[${LoggerKey} Context]`, 'Router Context is already defined, router prop will be ignored', {
      context: outerRouter,
      props: router ?? options,
    });
  }

  const resolveRouter = () => {
    if (outerRouter) return outerRouter;
    const _router = setRouter(router, options);
    Logger.debug(`[${LoggerKey} Context]`, 'Router Context set:', _router);
    return _router;
  };

  const resolvedRouter: IRouter = resolveRouter();

  onMount(() => {
    if (resolvedRouter?.ready) return;
    resolvedRouter?.init();
  });

  onDestroy(() => resolvedRouter?.destroy());
</script>

{#if resolvedRouter}
  {@render children?.(resolvedRouter)}
{:else}
  <span>Failed to initialize router</span>
{/if}
