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

  import { RouterContextSymbol } from '~/models/router.model.js';
  import { Logger, LoggerKey } from '~/utils/logger.utils.js';

  if (import.meta.env.MODE === 'development') {
    const contextRouter = getContext<IRouter>(RouterContextSymbol);
    Logger.info(`[${LoggerKey} Debugger]`, 'router attached to "window.router"', contextRouter);
    window[RouterDebuggerConstant] = { ...window[RouterDebuggerConstant], [contextRouter.id]: contextRouter };

    onDestroy(() => {
      Logger.info(`[${LoggerKey} Debugger]`, 'router detached from "window.router"', contextRouter);
      delete window[RouterDebuggerConstant]?.[contextRouter.id];
    });
  }
</script>
