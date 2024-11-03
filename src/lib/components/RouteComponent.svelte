<script lang="ts">
  import { type AnyComponent, type AnySnippet, isSnippet, resolveComponent } from '@dvcol/svelte-utils/component';
  import { type Component, type Snippet, untrack } from 'svelte';

  import type { RouterViewProps } from '~/models/component.model.js';
  import type { IRouter } from '~/models/router.model.js';

  import type { View } from '~/router/view.svelte.js';

  import RouteTransition from '~/components/RouteTransition.svelte';
  import { type ComponentProps, type Route } from '~/models/route.model.js';
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

  // Resolve route, loading or error component to be rendered
  let ResolvedComponent = $state<Component | Snippet<[unknown]>>();

  // Generate a unique identifier for each loading state, to prevent cancelled navigations from updating the view
  const change: ViewChangeEvent = $derived(new ViewChangeEvent({ view: { id: view.id, name: view.name }, route }));

  // Extract routing state
  const routing = $derived(!!router?.routing?.active);

  // Delay properties update until component is resolved
  let _properties: ComponentProps | undefined = $state();

  const listeners = $derived.by(() => {
    const _uuid = change.uuid;
    return {
      onStart: () => {
        if (change.uuid !== _uuid) return;
        return untrack(() => view.start(change));
      },
      onLoading: () => {
        if (change.uuid !== _uuid) return;
        ResolvedComponent = loading;
        return untrack(() => view.load());
      },
      onLoaded: (_component?: AnyComponent | AnySnippet) => {
        if (change.uuid !== _uuid) return;
        ResolvedComponent = _component;
        _properties = properties;
        return untrack(() => view.complete());
      },
      onError: (err: unknown) => {
        if (change.uuid !== _uuid) return;
        ResolvedComponent = error;
        return untrack(() => view.fail(err));
      },
    };
  });

  // Trigger component resolution on route change
  $effect(() => {
    resolveComponent(component, listeners);
  });

  // Trigger transition on route change or component update
  const transitionKey = $derived.by(() => {
    const _keys: any[] = [ResolvedComponent];
    if (transition?.updateOnRouteChange) _keys.push(change.uuid);
    if (transition?.updateOnPropsChange) _keys.push(_properties);
    if (routingSnippet) _keys.push(routing);
    return _keys;
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
  <RouteTransition id={view.id} key={transitionKey} {transition}>
    {@render result()}
  </RouteTransition>
{:else}
  {@render result()}
{/if}
