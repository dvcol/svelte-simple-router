<script lang="ts" module>
  import { type IView, ViewDebuggerConstant } from '~/models/index.js';

  declare global {
    interface Window {
      [ViewDebuggerConstant]?: Record<string, IView>;
    }
  }
</script>

<script lang="ts">
  import { onDestroy } from 'svelte';

  import { useView } from '~/router/hooks.svelte.js';
  import { Logger, LoggerKey } from '~/utils/index.js';

  const view = useView();
  Logger.info(`[${LoggerKey} Debugger - ${view.id}]`, `view attached to "window.${ViewDebuggerConstant}"`, view);
  window[ViewDebuggerConstant] = { ...window[ViewDebuggerConstant], [view.id]: view };

  const name = $derived(view.name);
  const loading = $derived(view.loading);
  const error = $derived<Error | any>(view.error);

  onDestroy(() => {
    Logger.info(`[${LoggerKey} Debugger - ${view.id}]`, `router detached from "window.${ViewDebuggerConstant}"`, view);
    delete window[ViewDebuggerConstant]?.[view.id];
  });
</script>

<div class="debug">
  <h3>View - {view?.id}</h3>
  <br />
  <div>Name - {name}</div>
  <div>Loading - <span class:loading>{loading}</span></div>
  <br />
  {#if error}
    <div>
      <h1>Navigation Error</h1>
      <p class="error">{error?.message ?? error}</p>
      {#if error?.stack}
        <p class="error">{error.stack}</p>
      {/if}
    </div>
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
  }

  .error {
    color: red;
  }

  .loading {
    color: orangered;
    font-weight: bold;
  }
</style>
