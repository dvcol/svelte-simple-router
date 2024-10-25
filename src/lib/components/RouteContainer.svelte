<script lang="ts">
  import { onDestroy } from 'svelte';

  import type { RouteContainerProps } from '~/models/router.model.js';

  import RouteComponent from '~/components/RouteComponent.svelte';

  import { useRouter } from '~/router/use-router.svelte.js';

  const {
    name,
    transition,
    // hooks
    beforeEach,
    onLoading,
    onLoaded,
    onError,
    onStart,
    onEnd,
    // snippets
    routing: routingSnippet,
    loading: loadingSnippet,
    error: errorSnippet,
  }: RouteContainerProps = $props();

  const router = useRouter();
  const route = $derived(router.route);

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

  onDestroy(() => subs.forEach(sub => sub()));
</script>

{#if router}
  <RouteComponent
    properties={resolvedProps}
    component={ResolvedComponent}
    loading={ResolvedLoading}
    error={ResolvedError}
    {name}
    {route}
    {router}
    {transition}
    {onLoading}
    {onLoaded}
    {onError}
    {errorSnippet}
    {loadingSnippet}
    {routingSnippet}
  />
{:else}
  <h3 style="color: red">Router not found</h3>
  <p style="color:red">Make sure you are calling useRoutes inside a RouterContext or RouterView component tree.</p>
{/if}
