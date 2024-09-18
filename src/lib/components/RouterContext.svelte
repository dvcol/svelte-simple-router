<script lang="ts">
  import { onDestroy, setContext } from 'svelte';

  import { type IRouter, type RouterContextProps, RouterContextSymbol } from '~/models/router.model.js';

  import { Router } from '~/router/router.svelte.js';
  import { useRouter } from '~/router/use-router.svelte.js';
  import { Logger, LoggerKey } from '~/utils/logger.utils.js';

  const { children, router, options }: RouterContextProps = $props();

  const outerRouter = useRouter();

  if (outerRouter && (router || options)) {
    Logger.warn(`[${LoggerKey} Context]`, 'Router Context is already defined, router prop will be ignored', {
      context: outerRouter,
      props: router ?? options,
    });
  }

  const createInnerRouter = (_router: IRouter = new Router(options)) => {
    setContext(RouterContextSymbol, _router);
    Logger.debug(`[${LoggerKey} Context]`, 'Router Context set:', _router);
    return _router;
  };

  const innerRouter: IRouter | undefined = !outerRouter ? createInnerRouter(router) : undefined;
  const resolvedRouter: IRouter = (outerRouter ?? innerRouter)!;

  onDestroy(() => {
    if (!innerRouter) return;
    setContext(RouterContextSymbol, null);
    Logger.debug(`[${LoggerKey} Context]`, 'Router Context unset:', innerRouter);
  });
</script>

{#if resolvedRouter}
  {@render children?.(resolvedRouter)}
{:else}
  <span>Failed to initialize router</span>
{/if}
