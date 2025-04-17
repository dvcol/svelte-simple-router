<script lang="ts">
  import type { RouterViewProps, RouteViewProps } from '~/models/component.model';

  import RouterContext from '~/components/RouterContext.svelte';
  import RouterView from '~/components/RouterView.svelte';
  import RouteView from '~/components/RouteView.svelte';

  const {
    options,
    router,
    transition,
    route,
    namedRoute,
    snippets,
  }: RouterViewProps & { route?: RouteViewProps['route']; namedRoute?: RouteViewProps['route']; snippets?: boolean } = $props();
</script>

{#snippet loading()}
  <div data-testid="default-loading"><h1>Default Loading</h1></div>
{/snippet}
{#snippet error(_error: Error)}
  <div data-testid="default-error">
    <h1>Default Error</h1>
    {#if _error}
      <p data-testid="error-message">{_error?.message ?? _error}</p>
    {/if}
  </div>
{/snippet}

{#snippet defaultNested()}
  <p data-testid="default-route-view-snippet">Nested Snippet from default view</p>
{/snippet}

{#snippet NamedNested()}
  <p data-testid="nested-route-view-snippet">Nested Snippet from default view</p>
{/snippet}

<RouterContext {options} {router}>
  <RouterView {transition}>
    {#if route}
      <RouteView {route} {loading} {error} nested={snippets ? defaultNested : undefined}>
        <div data-testid="default-route-view">
          <h1>Default Route View</h1>
          <span data-testid="route-name">{route.name}</span>
        </div>
      </RouteView>
    {/if}
  </RouterView>
  <RouterView name="nested">
    {#if namedRoute}
      <RouteView route={namedRoute} {loading} {error} nested={snippets ? NamedNested : undefined}>
        <div data-testid="nested-route-view">
          <h1>Nested Route View</h1>
          <span data-testid="route-name">{namedRoute.name}</span>
        </div>
      </RouteView>
    {/if}
  </RouterView>
</RouterContext>
