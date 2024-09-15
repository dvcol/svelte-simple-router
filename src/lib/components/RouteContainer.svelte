<script lang="ts">
  import { type Snippet } from 'svelte';

  import type { IRouter } from '~/models/router.model.js';

  import { useRouter } from '~/router/use-router.svelte.js';
  import { resolveComponent } from '~/utils/svelte.utils.js';

  type RouteContainerProps = {
    name?: string;
    children?: Snippet<[IRouter<any> | undefined]>;
    loading?: Snippet<[unknown]>;
    error?: Snippet<[unknown]>;
  };

  const { children, loading: viewLoading, error: viewError, name }: RouteContainerProps = $props();

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
</script>

{@render children?.(router)}

{#await resolveComponent(ResolvedComponent)}
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
