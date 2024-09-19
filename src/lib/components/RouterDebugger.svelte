<script lang="ts" module>
  import type { IRouter } from '~/models/router.model.js';

  import { RouterDebuggerConstant } from '~/models/router.model.js';

  declare global {
    interface Window {
      [RouterDebuggerConstant]?: Record<string, IRouter>;
      symbols?: Record<string, symbol>;
    }
  }
</script>

<script lang="ts">
  import { getContext, onDestroy } from 'svelte';

  import { type IRouter, RouterContextSymbol } from '~/models/router.model.js';
  import { Logger, LoggerKey } from '~/utils/logger.utils.js';

  const router = getContext<IRouter>(RouterContextSymbol);
  Logger.info(`[${LoggerKey} Debugger]`, 'router attached to "window.router"', router);
  window[RouterDebuggerConstant] = { ...window[RouterDebuggerConstant], [router.id]: router };

  const options = $derived(router.options);

  onDestroy(() => {
    Logger.info(`[${LoggerKey} Debugger]`, 'router detached from "window.router"', router);
    delete window[RouterDebuggerConstant]?.[router.id];
  });
</script>

<div class="debug">
  <h3>Router options - {router?.id}</h3>
  <pre>{JSON.stringify(options, null, 2)}</pre>
</div>

<style>
  .debug {
    margin: 1rem 0;
    padding: 1rem;
    background-color: color-mix(in srgb, transparent, white 10%);
    border-radius: 0.5rem;

    h3 {
      margin-top: 0;
    }
  }
</style>
