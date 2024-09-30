<script lang="ts">
  import { type Component } from 'svelte';

  import type { IRouter, RouterViewProps } from '~/models/router.model.js';

  import RouteTransition from '~/components/RouteTransition.svelte';
  import { type ComponentProps, toBaseRoute } from '~/models/route.model.js';
  import { type AnyComponent, type ComponentOrLazy, resolveComponent } from '~/utils/svelte.utils.js';

  const {
    // components
    properties,
    component,
    loading,
    error,
    // route
    route,
    router,
    transition,
    // hooks
    onLoading,
    onLoaded,
    onError,
    // snippets
    children,
    errorSnippet,
    loadingSnippet,
  }: {
    // components
    properties?: ComponentProps;
    component?: ComponentOrLazy;
    loading?: Component;
    error?: Component;
    // router
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
  } = $props();

  // Resolve route, loading or error component to be rendered
  let ResolvedComponent = $state<Component>();
  let _error = $state();
  let _loading = $state();

  // Generate a unique identifier for each loading state, to prevent cancelled navigations from updating the view
  const routeUUID: string = $derived.by(() => {
    if (route) return crypto.randomUUID();
    return '';
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
    return (_component?: AnyComponent) => {
      if (routeUUID !== _uuid) return;
      ResolvedComponent = _component;
      _properties = properties;
      _loading = false;
      return onLoaded?.(_route);
    };
  });

  const _onError = $derived.by(() => {
    const _route = toBaseRoute(route);
    const _uuid = routeUUID;
    return (err: unknown) => {
      if (routeUUID !== _uuid) return;
      _error = err;
      ResolvedComponent = error;
      _loading = false;
      return onError?.(err, { route: _route });
    };
  });

  // Trigger component resolution on route change
  $effect(() => {
    resolveComponent(component, { onLoading: _onLoading, onLoaded: _onLoaded, onError: _onError });
  });
</script>

{#snippet view()}
  {#if ResolvedComponent}
    <ResolvedComponent error={_error} {..._properties}>
      {@render children?.(router)}
    </ResolvedComponent>
  {:else if _error}
    {@render errorSnippet?.(_error)}
  {:else if _loading}
    {@render loadingSnippet?.(router)}
  {/if}
{/snippet}

{@render children?.(router)}

{#if transition}
  <RouteTransition key={ResolvedComponent} {transition}>
    {@render view()}
  </RouteTransition>
{:else}
  {@render view()}
{/if}
