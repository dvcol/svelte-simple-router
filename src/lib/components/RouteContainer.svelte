<script lang="ts">
  import { onDestroy } from 'svelte';

  import type { RouteContainerProps } from '~/models/component.model.js';

  import RouteComponent from '~/components/RouteComponent.svelte';

  import { setView } from '~/router/context.svelte.js';
  import { useRouter } from '~/router/use-router.svelte.js';
  import { View } from '~/router/view.svelte.js';

  const {
    name,
    transition,
    // hooks
    beforeEach,
    onError,
    onStart,
    onEnd,
    onChange,
    onLoading,
    onLoaded,
    // snippets
    routing: routingSnippet,
    loading: loadingSnippet,
    error: errorSnippet,
    // children
    children,
  }: RouteContainerProps = $props();

  // Extract router from context
  const router = useRouter();
  const route = $derived(router.route);

  // Instantiate view and set it in context
  const view = new View(router.id, name);
  setView(view);

  // Extract component props from route
  const resolvedProps = $derived.by(() => {
    if (name) return route?.properties?.[name];
    return route?.props ?? route?.properties?.default;
  });

  // Extract component from route
  const component = $derived(route?.component);
  const components = $derived(route?.components);
  const ResolvedComponent = $derived.by(() => {
    if (name) return components?.[name];
    return component ?? components?.default;
  });

  // Extract loading component from route
  const loading = $derived(route?.loading);
  const loadings = $derived(route?.loadings);
  const ResolvedLoading = $derived.by(() => {
    if (name) return loadings?.[name];
    return loading ?? loadings?.default;
  });

  // Extract error component from route
  const error = $derived(route?.error);
  const errors = $derived(route?.errors);
  const ResolvedError = $derived.by(() => {
    if (name) return errors?.[name];
    return error ?? errors?.default;
  });

  const subs: (() => void)[] = [];

  if (beforeEach) subs.push(router.beforeEach(beforeEach));
  if (onStart) subs.push(router.onStart(onStart));
  if (onEnd) subs.push(router.onEnd(onEnd));
  if (onError) subs.push(router.onError(onError));

  if (onChange) subs.push(view.onChange(onChange));
  if (onLoading) subs.push(view.onLoading(onLoading));
  if (onLoaded) subs.push(view.onLoaded(onLoaded));
  if (onError) subs.push(view.onError(onError));

  onDestroy(() => subs.forEach(sub => sub()));
</script>

{#if router}
  {@render children?.(router)}
  <RouteComponent
    properties={resolvedProps}
    component={ResolvedComponent}
    loading={ResolvedLoading}
    error={ResolvedError}
    {router}
    {view}
    {route}
    {transition}
    {errorSnippet}
    {loadingSnippet}
    {routingSnippet}
  />
{:else}
  <h3 style="color: red">Router not found</h3>
  <p style="color:red">Make sure you are calling useRoutes inside a RouterContext or RouterView component tree.</p>
{/if}
