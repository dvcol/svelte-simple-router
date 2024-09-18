<script lang="ts">
  import { onDestroy, onMount, type Snippet } from 'svelte';

  import type { IRouter } from '~/models/router.model.js';

  import {
    type LoadingListener,
    type NavigationEndListener,
    type NavigationErrorListener,
    type NavigationGuard,
    type NavigationListener,
    toBasicRoute,
  } from '~/models/route.model.js';

  import { useRouter } from '~/router/use-router.svelte.js';
  import { resolveComponent } from '~/utils/svelte.utils.js';

  type RouteContainerProps = {
    name?: string;
    children?: Snippet<[IRouter<any> | undefined]>;
    loading?: Snippet<[unknown]>;
    error?: Snippet<[unknown]>;
    onLoading?: LoadingListener;
    onLoaded?: LoadingListener;
    onError?: NavigationErrorListener;
    onStart?: NavigationListener;
    onEnd?: NavigationEndListener;
    beforeEach?: NavigationGuard;
  };

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
  }: RouteContainerProps = $props();

  const router = useRouter();
  const route = $derived(router?.route);

  const component = $derived(route?.component);
  const components = $derived(route?.components);

  const ResolvedComponent = $derived.by(() => {
    if (name) return components?.[name];
    return component ?? components?.default;
  });
  const loading = $derived(route?.loading);
  const loadings = $derived(route?.loadings);

  const ResolvedLoading = $derived.by(() => {
    if (name) return loadings?.[name];
    return loading ?? loadings?.default;
  });

  const error = $derived(route?.error);
  const errors = $derived(route?.errors);

  const ResolvedError = $derived.by(() => {
    if (name) return errors?.[name];
    return error ?? errors?.default;
  });

  const loadingUUID: string | undefined = $derived(route ? crypto.randomUUID() : undefined);
  const _onLoading = $derived.by(() => {
    const _route = toBasicRoute(route);
    const _uuid = loadingUUID;
    return () => loadingUUID === _uuid && onLoading?.(_route);
  });
  const _onLoaded = $derived.by(() => {
    const _route = toBasicRoute(route);
    const _uuid = loadingUUID;
    return () => loadingUUID === _uuid && onLoaded?.(_route);
  });
  const _onError = $derived.by(() => {
    const _route = toBasicRoute(route);
    const _uuid = loadingUUID;
    return (err: unknown) => loadingUUID === _uuid && onError?.(err, { route: _route });
  });

  const subs: (() => void)[] = [];
  onMount(() => {
    if (!router) return;
    if (beforeEach) subs.push(router.beforeEach(beforeEach));
    if (onStart) subs.push(router.onStart(onStart));
    if (onEnd) subs.push(router.onEnd(onEnd));
    if (onError) subs.push(router.onError(onError));
  });
  onDestroy(() => subs.forEach(sub => sub()));
</script>

{@render children?.(router)}

{#await resolveComponent(ResolvedComponent, { onLoading: _onLoading, onLoaded: _onLoaded, onError: _onError })}
  {#if ResolvedLoading}
    <ResolvedLoading>
      {@render children?.(router)}
    </ResolvedLoading>
  {:else}
    {@render viewLoading?.(children)}
  {/if}
{:then Component}
  <Component>
    {@render children?.(router)}
  </Component>
{:catch err}
  {#if ResolvedError}
    <ResolvedError error={err}>
      {@render children?.(router)}
    </ResolvedError>
  {:else}
    {@render viewError?.(err)}
  {/if}
{/await}
