<script lang="ts">
  import type { RouterContextProps } from '~/models/component.model.js';
  import type { IRouter } from '~/models/router.model.js';

  import { onDestroy } from 'svelte';

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

  const resolvedRouter: IRouter = outerRouter ?? setRouter(router, options);
  if (!outerRouter) Logger.debug(`[${LoggerKey} Context]`, 'Router Context set:', resolvedRouter);

  $effect.pre(() => {
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
