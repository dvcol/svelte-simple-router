<script lang="ts">
  import { type Component, onDestroy } from 'svelte';

  import type { RouterViewProps } from '~/models/router.model.js';

  import RouteContainerTransition from '~/components/RouteContainerTransition.svelte';
  import { MissingRouterContextError } from '~/models/error.model.js';
  import { type ParsedRoute, toBaseRoute } from '~/models/route.model.js';

  import { useRouter } from '~/router/use-router.svelte.js';
  import { type AnyComponent, resolveComponent } from '~/utils/svelte.utils.js';

  const {
    children,
    loading: viewLoading,
    error: viewError,
    name,
    onLoading,
    onLoaded,
    onError,
    onStart,
    onEnd,
    beforeEach,
    transition,
  }: Omit<RouterViewProps, 'options' | 'router'> = $props();

  const router = useRouter();
  if (!router) throw new MissingRouterContextError();

  const route = $derived(router?.route);

  // Extract component props from route
  const resolvedProps = $derived.by<ParsedRoute['props'] | undefined>(() => {
    if (name) return route?.props?.[name];
    return route?.props;
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

  // Resolve route, loading or error component to be rendered
  let Resolved = $state<Component>();
  let _error = $state();
  let _loading = $state();

  // Generate a unique identifier for each loading state, to prevent cancelled navigations from updating the view
  const loadingUUID: string = $derived.by(() => {
    if (route) return crypto.randomUUID();
    return '';
  });

  const _onLoading = $derived.by(() => {
    const _route = toBaseRoute(route);
    const _uuid = loadingUUID;
    return () => {
      if (loadingUUID !== _uuid) return;
      Resolved = ResolvedLoading;
      _loading = true;
      return onLoading?.(_route);
    };
  });

  const _onLoaded = $derived.by(() => {
    const _route = toBaseRoute(route);
    const _uuid = loadingUUID;
    return (_component?: AnyComponent) => {
      if (loadingUUID !== _uuid) return;
      Resolved = _component;
      _loading = false;
      return onLoaded?.(_route);
    };
  });

  const _onError = $derived.by(() => {
    const _route = toBaseRoute(route);
    const _uuid = loadingUUID;
    return (err: unknown) => {
      if (loadingUUID !== _uuid) return;
      _error = err;
      Resolved = ResolvedError;
      _loading = false;
      return onError?.(err, { route: _route });
    };
  });

  // Trigger component resolution on route change
  $effect(() => {
    resolveComponent(ResolvedComponent, { onLoading: _onLoading, onLoaded: _onLoaded, onError: _onError });
  });

  const subs: (() => void)[] = [];

  if (beforeEach) subs.push(router.beforeEach(beforeEach));
  if (onStart) subs.push(router.onStart(onStart));
  if (onEnd) subs.push(router.onEnd(onEnd));
  if (onError) subs.push(router.onError(onError));

  onDestroy(() => subs.forEach(sub => sub()));
</script>

{#if router}
  {#snippet view()}
    {#if Resolved}
      <Resolved error={_error} {...resolvedProps}>
        {@render children?.(router)}
      </Resolved>
    {:else if _error}
      {@render viewError?.(_error)}
    {:else if _loading}
      {@render viewLoading?.(router)}
    {/if}
  {/snippet}

  {@render children?.(router)}

  {#if transition}
    <RouteContainerTransition key={[loadingUUID, Resolved]} {transition}>
      {@render view()}
    </RouteContainerTransition>
  {:else}
    {@render view()}
  {/if}
{:else}
  <h3 style="color: red">Router not found</h3>
  <p style="color:red">Make sure you are calling useRoutes inside a RouterContext or RouterView component tree.</p>
{/if}
