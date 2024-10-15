<script lang="ts">
  import { onDestroy } from 'svelte';

  import type { Route, RouteViewProps } from '~/models/index.js';

  import { MissingRouterContextError } from '~/models/index.js';
  import { useRouter, useView } from '~/router/use-router.svelte.js';
  import { Logger, LoggerKey } from '~/utils/logger.utils.js';

  const { children, loading, error, route }: RouteViewProps = $props();

  const router = useRouter();
  if (!router) throw new MissingRouterContextError();

  const name = useView();

  if (!children && !route.redirect && !route.components?.[name || 'default'] && !route.component) {
    Logger.warn(`[${LoggerKey} Route - ${router.id}]`, 'Route has no component, redirect or children', route);
  }

  const _route = {
    component: name ? undefined : children,
    components: name ? { [name]: children } : undefined,
    error,
    loading,
    ...route,
  } as Route;

  router.addRoute(_route);
  router.sync();
  Logger.debug(`[${LoggerKey} Route - ${router.id}]`, 'Route added', { route, children });

  onDestroy(() => {
    router.removeRoute(_route);
    router.sync();
    Logger.debug(`[${LoggerKey} Route - ${router.id}]`, 'Route removed', route);
  });
</script>
