<script lang="ts">
  import { onDestroy } from 'svelte';

  import type { RouteViewProps } from '~/models/component.model.js';
  import type { Route } from '~/models/route.model.js';

  import { NavigationCancelledError } from '~/models/error.model.js';

  import { DefaultView } from '~/models/view.model.js';
  import { getView } from '~/router/context.svelte.js';
  import { useRouter } from '~/router/use-router.svelte.js';
  import { Logger, LoggerKey } from '~/utils/logger.utils.js';

  const { children, loading, error, route, name, ..._props }: RouteViewProps = $props();

  const router = useRouter();

  const _name = name ?? getView()?.name;

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

  if (_name && _name !== DefaultView) {
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

  const log = `[${LoggerKey} Route - ${router.id}]`;

  if (!_route.redirect && !_route.component && !_route.components?.[_name || DefaultView]) {
    Logger.warn(log, 'Route has no component, redirect or children', _route);
  }

  const handleError = (err: Error | unknown) => {
    if (err instanceof NavigationCancelledError) {
      Logger.warn(log, `Failed to sync, navigation cancelled`, err);
    } else {
      Logger.error(log, `Failed to sync`, err);
    }
  };

  router.addRoute(_route);
  Logger.debug(log, 'Route added', { route, children });
  router.sync().catch(handleError);

  onDestroy(() => {
    router.removeRoute(_route);
    Logger.debug(log, 'Route removed', route);
    router.sync().catch(handleError);
  });
</script>
