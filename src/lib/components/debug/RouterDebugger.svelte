<script lang="ts" module>
  import type { IRouter } from '~/models/router.model.js';

  import { RouterDebuggerConstant } from '~/models/router.model.js';

  declare global {
    interface Window {
      [RouterDebuggerConstant]?: Record<string, IRouter>;
    }
  }
</script>

<script lang="ts">
  import { onDestroy } from 'svelte';

  import { useRouter } from '~/router/hooks.svelte.js';
  import { Logger, LoggerKey } from '~/utils/logger.utils.js';

  const router = useRouter();
  Logger.info(`[${LoggerKey} Debugger - ${router.id}]`, `router attached to "window.${RouterDebuggerConstant}"`, router);
  window[RouterDebuggerConstant] = { ...window[RouterDebuggerConstant], [router.id]: router };

  const options = $derived(router.options);
  const routing = $derived(router.routing);
  const location = $derived(router.location);

  onDestroy(() => {
    Logger.info(`[${LoggerKey} Debugger - ${router.id}]`, `router detached from "window.${RouterDebuggerConstant}"`, router);
    delete window[RouterDebuggerConstant]?.[router.id];
  });
</script>

<div class="debug">
  <h3>Router options - {router?.id}</h3>
  <pre>{JSON.stringify(options, null, 2)}</pre>

  <h3>Routing</h3>
  <div>Pending - <span class:route={routing?.active}>{!!routing?.active}</span></div>
  {#if routing}
    <p>
      From <span class="route">{routing.from?.location?.name ?? routing?.from?.location?.path ?? '-'}</span> to
      <span class="route">{routing.to?.name ?? routing?.to?.path ?? '-'}</span>
    </p>
  {:else}
    <p>Navigated to <span class="route">{location?.name ?? location?.path}</span></p>
  {/if}
</div>

<style>
  .debug {
    width: fit-content;
    margin: 1rem 0;
    padding: 1rem;
    background-color: color-mix(in srgb, transparent, white 10%);
    border-radius: 0.5rem;

    h3 {
      margin-top: 0;
    }

    .route {
      color: orangered;
      font-weight: bold;
    }
  }
</style>
