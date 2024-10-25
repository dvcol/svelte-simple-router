<script lang="ts">
  import { onDestroy } from 'svelte';

  import type { Route, RouteViewProps } from '~/models/index.js';

  import { useRouter, useView } from '~/router/use-router.svelte.js';
  import { Logger, LoggerKey } from '~/utils/logger.utils.js';

  const { children, loading, error, route, name, ..._props }: RouteViewProps = $props();

  const router = useRouter();

  const _name = name ?? useView();

  let component: Route['component'] | undefined;
  let components: Route['components'] | undefined;

  // Extract snippet/component from props
  if (Object.keys(_props).length) {
    components = Object.entries(_props).reduce<NonNullable<Route['components']>>((acc, [key, value]) => {
      if (typeof value !== 'function') return acc;
      acc[key] = value;
      return acc;
    }, {});
    if (!Object.keys(components).length) components = undefined;
  }

  if (_name) {
    components ??= {};
    if (components[_name]) components.default = children;
    else components[_name] = children;
  } else {
    component = children;
  }

  const _route = {
    ...route,
    component: route.component ?? component,
    components: route.components ?? components,
    error: route.error ?? error,
    loading: route.loading ?? loading,
  } as Route;

  if (!_route.redirect && !_route.component && !_route.components?.[_name || 'default']) {
    Logger.warn(`[${LoggerKey} Route - ${router.id}]`, 'Route has no component, redirect or children', _route);
  }

  router.addRoute(_route);
  router.sync();
  Logger.debug(`[${LoggerKey} Route - ${router.id}]`, 'Route added', { route, children });

  onDestroy(() => {
    router.removeRoute(_route);
    router.sync();
    Logger.debug(`[${LoggerKey} Route - ${router.id}]`, 'Route removed', route);
  });
</script>
