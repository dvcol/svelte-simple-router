<script lang="ts">
  import { type Component, type Snippet } from 'svelte';

  import type { IRouter, RouterViewProps } from '~/models/router.model.js';

  import RouteTransition from '~/components/RouteTransition.svelte';
  import { type ComponentProps, type Route, toBaseRoute } from '~/models/route.model.js';
  import { Logger, LoggerKey } from '~/utils/logger.utils.js';
  import { type AnyComponent, type AnySnippet, isSnippet, resolveComponent } from '~/utils/svelte.utils.js';

  const {
    // components
    properties,
    component,
    loading,
    error,
    // route
    name,
    route,
    router,
    transition,
    // hooks
    onLoading,
    onLoaded,
    onError,
    // snippets
    errorSnippet,
    loadingSnippet,
    routingSnippet,
  }: {
    // components
    properties?: ComponentProps;
    component?: Route['component'];
    loading?: Route['loading'];
    error?: Route['error'];
    // router
    name?: string;
    route: IRouter['route'];
    router: IRouter;
    transition?: RouterViewProps['transition'];
    // hooks
    onLoading?: RouterViewProps['onLoading'];
    onLoaded?: RouterViewProps['onLoaded'];
    onError?: RouterViewProps['onError'];
    // snippets
    children?: RouterViewProps['children'];
    errorSnippet?: RouterViewProps['error'];
    loadingSnippet?: RouterViewProps['loading'];
    routingSnippet?: RouterViewProps['routing'];
  } = $props();

  // Resolve route, loading or error component to be rendered
  let ResolvedComponent = $state<Component | Snippet<[unknown]>>();
  let _error = $state();
  let _loading = $state(false);

  // Generate a unique identifier for each loading state, to prevent cancelled navigations from updating the view
  const routeUUID: string = $derived.by(() => {
    if (route) return crypto.randomUUID();
    return '';
  });

  // Extract routing state
  const routing = $derived(router?.routing?.active);

  // Trigger transition on route change or component update
  const transitionKey = $derived.by(() => {
    const _keys: any[] = [ResolvedComponent];
    if (transition?.updateOnRouteChange) _keys.push(routeUUID);
    if (routingSnippet) _keys.push(routing);
    return _keys;
  });

  // Delay properties update until component is resolved
  let _properties: ComponentProps | undefined = $state();

  const _onLoading = $derived.by(() => {
    const _route = toBaseRoute(route);
    const _uuid = routeUUID;
    return () => {
      if (routeUUID !== _uuid) return;
      ResolvedComponent = loading;
      _loading = true;
      return onLoading?.(_route);
    };
  });

  const _onLoaded = $derived.by(() => {
    const _route = toBaseRoute(route);
    const _uuid = routeUUID;
    return (_component?: AnyComponent | AnySnippet) => {
      if (routeUUID !== _uuid) return;
      ResolvedComponent = _component;
      _properties = properties;
      _error = undefined;
      _loading = false;
      return onLoaded?.(_route);
    };
  });

  const _onError = $derived.by(() => {
    const _route = toBaseRoute(route);
    const _uuid = routeUUID;
    return (err: unknown) => {
      if (routeUUID !== _uuid) return;
      ResolvedComponent = error;
      _error = err;
      _loading = false;
      Logger.error([`[${LoggerKey} View`, name ? ` ${name}` : '', router ? ` - ${router.id}` : '', ']'].join(''), 'Fail to load', {
        err,
        route: toBaseRoute(route),
      });
      return onError?.(err, { route: _route });
    };
  });

  // Trigger component resolution on route change
  $effect(() => {
    resolveComponent(component, { onLoading: _onLoading, onLoaded: _onLoaded, onError: _onError });
  });
</script>

{#snippet routed()}
  {#if ResolvedComponent}
    {#if isSnippet(ResolvedComponent)}
      {@render ResolvedComponent(_error ?? (_loading ? route : _properties))}
    {:else}
      <ResolvedComponent error={_error} {..._properties} />
    {/if}
  {:else if _loading}
    {@render loadingSnippet?.(route)}
  {:else if _error}
    {@render errorSnippet?.(_error)}
  {/if}
{/snippet}

{#snippet view()}
  {#if routing && routingSnippet}
    {@render routingSnippet(router.routing)}
  {:else}
    {@render routed()}
  {/if}
{/snippet}

{#if transition}
  <RouteTransition key={transitionKey} {transition}>
    {@render view()}
  </RouteTransition>
{:else}
  {@render view()}
{/if}
