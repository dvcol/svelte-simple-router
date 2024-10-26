<script lang="ts">
  import { onDestroy } from 'svelte';

  import type { RouterContextProps } from '~/models/component.model.js';

  import { type IRouter } from '~/models/router.model.js';

  import { getRouter, setRouter } from '~/router/context.svelte.js';
  import { Router } from '~/router/router.svelte.js';
  import { Logger, LoggerKey } from '~/utils/logger.utils.js';

  const { children, router, options }: RouterContextProps = $props();

  const outerRouter = getRouter();

  if (outerRouter && (router || options)) {
    Logger.warn(`[${LoggerKey} Context]`, 'Router Context is already defined, router prop will be ignored', {
      context: outerRouter,
      props: router ?? options,
    });
  }

  const createInnerRouter = (_router: IRouter = new Router(options)) => {
    setRouter(_router);
    Logger.debug(`[${LoggerKey} Context]`, 'Router Context set:', _router);
    return _router;
  };

  const innerRouter: IRouter | undefined = outerRouter ? undefined : createInnerRouter(router);
  const resolvedRouter: IRouter = (outerRouter ?? innerRouter)!;

  onDestroy(() => {
    if (!innerRouter) return;
    innerRouter.destroy();
    Logger.debug(`[${LoggerKey} Context]`, 'Router Context destroyed', innerRouter);
  });
</script>

{#if resolvedRouter}
  {@render children?.(resolvedRouter)}
{:else}
  <span>Failed to initialize router</span>
{/if}
