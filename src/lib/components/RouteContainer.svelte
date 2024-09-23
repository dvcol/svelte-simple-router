<script lang="ts">
  import { onDestroy } from 'svelte';

  import type { RouterViewProps, TransitionFunction } from '~/models/router.model.js';

  import { MissingRouterContextError } from '~/models/error.model.js';
  import { type ParsedRoute, toBaseRoute } from '~/models/route.model.js';

  import { useRouter } from '~/router/use-router.svelte.js';
  import { resolveComponent } from '~/utils/svelte.utils.js';

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

  const component = $derived(route?.component);
  const components = $derived(route?.components);

  const resolvedProps = $derived.by<ParsedRoute['props'] | undefined>(() => {
    if (name) return route?.props?.[name];
    return route?.props;
  });

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
    const _route = toBaseRoute(route);
    const _uuid = loadingUUID;
    return () => loadingUUID === _uuid && onLoading?.(_route);
  });
  const _onLoaded = $derived.by(() => {
    const _route = toBaseRoute(route);
    const _uuid = loadingUUID;
    return () => loadingUUID === _uuid && onLoaded?.(_route);
  });
  const _onError = $derived.by(() => {
    const _route = toBaseRoute(route);
    const _uuid = loadingUUID;
    return (err: unknown) => loadingUUID === _uuid && onError?.(err, { route: _route });
  });

  const _in = $derived<TransitionFunction>(((node, props, options) => transition?.in?.(node, props, options)) as TransitionFunction);
  const _out = $derived<TransitionFunction>(((node, props, options) => transition?.out?.(node, props, options)) as TransitionFunction);
  const _inParams = $derived(transition?.params?.in || {});
  const _outParams = $derived(transition?.params?.out ?? {});
  const _transitionProps = $derived(transition?.props);

  const subs: (() => void)[] = [];

  if (beforeEach) subs.push(router.beforeEach(beforeEach));
  if (onStart) subs.push(router.onStart(onStart));
  if (onEnd) subs.push(router.onEnd(onEnd));
  if (onError) subs.push(router.onError(onError));

  onDestroy(() => subs.forEach(sub => sub()));
</script>

{#if router}
  {#snippet view()}
    {#await resolveComponent(ResolvedComponent, { onLoading: _onLoading, onLoaded: _onLoaded, onError: _onError })}
      {#if ResolvedLoading}
        <ResolvedLoading>
          {@render children?.(router)}
        </ResolvedLoading>
      {:else}
        {@render viewLoading?.(router)}
      {/if}
    {:then Component}
      <Component {...resolvedProps}>
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
  {/snippet}

  {@render children?.(router)}

  {#if transition}
    {#key route?.path}
      <div class="transition-container" in:_in={_inParams} out:_out={_outParams} {..._transitionProps}>
        {@render view()}
      </div>
    {/key}
  {:else}
    {@render view()}
  {/if}
{:else}
  <h3 style="color: red">Router not found</h3>
  <p style="color:red">Make sure you are calling useRoutes inside a RouterContext or RouterView component tree.</p>
{/if}
