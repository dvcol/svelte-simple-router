<script lang="ts">
  import type { AnyComponent, AnySnippet } from '@dvcol/svelte-utils/component';
  import type { Component, Snippet } from 'svelte';

  import type { RouterViewProps } from '~/models/component.model.js';
  import type { ComponentProps, Route } from '~/models/route.model.js';
  import type { IRouter } from '~/models/router.model.js';
  import type { View } from '~/router/view.svelte.js';

  import { debounce } from '@dvcol/common-utils/common/debounce';
  import { isSnippet, resolveComponent } from '@dvcol/svelte-utils/component';
  import { untrack } from 'svelte';

  import RouteTransition from '~/components/RouteTransition.svelte';
  import { ViewChangeEvent } from '~/router/event.svelte.js';

  const {
    // context
    router,
    view,
    // route
    route,
    transition,
    // components
    properties,
    component,
    loading,
    error,
    // snippets
    errorSnippet,
    loadingSnippet,
    routingSnippet,
  }: {
    // context
    router: IRouter;
    view: View;
    // route
    route: IRouter['route'];
    transition?: RouterViewProps['transition'];
    // components
    properties?: ComponentProps;
    component?: Route['component'];
    loading?: Route['loading'];
    error?: Route['error'];
    // snippets
    errorSnippet?: RouterViewProps['error'];
    loadingSnippet?: RouterViewProps['loading'];
    routingSnippet?: RouterViewProps['routing'];
  } = $props();

  type IComponentOrSnippet = Component | Snippet<[any]>;

  // If we should force a remount on route change
  const force = $derived<boolean>(!!(transition?.updateOnRouteChange || router?.routing?.options?.force));

  // Generate a unique identifier for each loading state, to prevent cancelled navigations from updating the view
  const change: ViewChangeEvent = $derived(new ViewChangeEvent({ view: { id: view.id, name: view.name }, route }));

  // Extract routing state
  let routing: boolean | undefined = $state();
  const setRouting = debounce((val: boolean) => {
    routing = val;
    return routing;
  }, 0);
  $effect(() => {
    setRouting(!!router?.routing?.active);
  });

  // Delay properties update until component is resolved
  let _properties: ComponentProps | undefined = $state();

  // Resolved route component when async loading & error handling is complete
  let resolvedComponent = $state<IComponentOrSnippet>();

  // Routed component to be rendered (loading, error, or resolved component)
  const routedComponent = $derived.by<IComponentOrSnippet | undefined>(() => {
    if (routing && routingSnippet) return routingSnippet;
    else if (view.loading && loading) return loading;
    else if (view.loading && loadingSnippet) return loadingSnippet;
    else if (view.error && error) return error;
    else if (view.error && errorSnippet) return errorSnippet;
    else if (resolvedComponent) return resolvedComponent;
  });

  // Routed snippet properties
  const routedProps = $derived.by(() => {
    if (routedComponent === errorSnippet) return view.error;
    if (routedComponent === routingSnippet) return router.routing;
    if (routedComponent === loadingSnippet) return route;
    return _properties;
  });

  // Trigger transition on route change or component update
  const transitionKey = $derived.by(() => {
    const _keys = [routedComponent];
    if (transition?.updateOnPropsChange) _keys.push(_properties);
    return _keys;
  });
  // Final unique identifier for the current route change
  let resolvedID = $state();

  const listeners = $derived.by(() => {
    const _uuid = change.uuid;
    return {
      onStart: () => {
        if (change.uuid !== _uuid) return;
        return untrack(() => view.start(change));
      },
      onLoading: () => {
        if (change.uuid !== _uuid) return;
        return untrack(() => view.load());
      },
      onLoaded: (_component?: AnyComponent | AnySnippet) => {
        if (change.uuid !== _uuid) return;
        resolvedComponent = _component;
        _properties = properties;
        if (force) resolvedID = _uuid;
        return untrack(() => view.complete());
      },
      onError: (err: unknown) => {
        if (change.uuid !== _uuid) return;
        if (force) resolvedID = _uuid;
        return untrack(() => view.fail(err));
      },
    };
  });

  // Trigger component resolution on route change
  $effect(() => {
    resolveComponent(component, listeners);
  });
</script>

{#snippet resolved(ComponentOrSnippet: IComponentOrSnippet)}
  {#key resolvedID}
    {#if isSnippet(ComponentOrSnippet)}
      {@render ComponentOrSnippet(routedProps)}
    {:else}
      <ComponentOrSnippet error={view.error} {..._properties} />
    {/if}
  {/key}
{/snippet}

{#snippet result()}
  {#if routedComponent}
    {@render resolved(routedComponent)}
  {/if}
{/snippet}

{#if transition}
  <RouteTransition id={view.id} key={transitionKey} {transition}>
    {@render result()}
  </RouteTransition>
{:else}
  {@render result()}
{/if}
