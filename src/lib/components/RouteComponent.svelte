<script lang="ts">
  import { type Component, type Snippet, untrack } from 'svelte';

  import type { RouterViewProps } from '~/models/component.model.js';
  import type { IRouter } from '~/models/router.model.js';

  import type { View } from '~/router/view.svelte.js';

  import RouteTransition from '~/components/RouteTransition.svelte';
  import { type ComponentProps, type Route, toBaseRoute } from '~/models/route.model.js';
  import { type AnyComponent, type AnySnippet, isSnippet, resolveComponent } from '~/utils/svelte.utils.js';

  const {
    // view
    view,
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
    // snippets
    errorSnippet,
    loadingSnippet,
    routingSnippet,
  }: {
    // view
    view: View;
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
    // snippets
    errorSnippet?: RouterViewProps['error'];
    loadingSnippet?: RouterViewProps['loading'];
    routingSnippet?: RouterViewProps['routing'];
  } = $props();

  // Resolve route, loading or error component to be rendered
  let ResolvedComponent = $state<Component | Snippet<[unknown]>>();

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

  const routeId = $derived([router.id, view.id, name].filter(Boolean).join('-'));

  // Delay properties update until component is resolved
  let _properties: ComponentProps | undefined = $state();

  const listeners = $derived.by(() => {
    const _route = toBaseRoute(route);
    const _uuid = routeUUID;
    return {
      onStart: () => {
        if (routeUUID !== _uuid) return;
        return untrack(() => view.start(_route));
      },
      onLoading: () => {
        if (routeUUID !== _uuid) return;
        ResolvedComponent = loading;
        return untrack(() => view.load());
      },
      onLoaded: (_component?: AnyComponent | AnySnippet) => {
        if (routeUUID !== _uuid) return;
        ResolvedComponent = _component;
        _properties = properties;
        return untrack(() => view.complete());
      },
      onError: (err: unknown) => {
        if (routeUUID !== _uuid) return;
        ResolvedComponent = error;
        return untrack(() => view.fail(err));
      },
    };
  });

  // Trigger component resolution on route change
  $effect(() => {
    resolveComponent(component, listeners);
  });
</script>

{#snippet routed()}
  {#if ResolvedComponent}
    {#if isSnippet(ResolvedComponent)}
      {@render ResolvedComponent(view.error ?? (view.loading ? route : _properties))}
    {:else}
      <ResolvedComponent error={view.error} {..._properties} />
    {/if}
  {:else if view.loading}
    {@render loadingSnippet?.(route)}
  {:else if view.error}
    {@render errorSnippet?.(view.error)}
  {/if}
{/snippet}

{#snippet result()}
  {#if routing && routingSnippet}
    {@render routingSnippet(router.routing)}
  {:else}
    {@render routed()}
  {/if}
{/snippet}

{#if transition}
  <RouteTransition id={routeId} key={transitionKey} {transition}>
    {@render result()}
  </RouteTransition>
{:else}
  {@render result()}
{/if}
