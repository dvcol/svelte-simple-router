<script lang="ts">
  import type {
    ErrorListener,
    IRouter,
    IView,
    LoadingErrorListener,
    NavigationEndListener,
    NavigationErrorListener,
    NavigationGuard,
    NavigationListener,
    ViewChangeListener,
  } from '~/models/index.js';

  import { beforeEach, onChange, onEnd, onError, onLoaded, onLoading, onRouterError, onStart, onViewError } from '~/router/hooks.svelte.js';

  const {
    name,
    callback,
    view,
    router,
  }: {
    name: 'beforeEach' | 'onStart' | 'onEnd' | 'onChange' | 'onLoading' | 'onLoaded' | 'onError' | 'onRouterError' | 'onViewError';
    callback:
      | ErrorListener
      | LoadingErrorListener
      | NavigationEndListener
      | NavigationErrorListener
      | NavigationGuard
      | NavigationListener
      | ViewChangeListener;
    view?: IView;
    router?: IRouter;
  } = $props();

  switch (name) {
    case 'beforeEach':
      beforeEach(callback, router);
      break;
    case 'onStart':
      onStart(callback, router);
      break;
    case 'onEnd':
      onEnd(callback, router);
      break;
    case 'onChange':
      onChange(callback, view);
      break;
    case 'onLoading':
      onLoading(callback, view);
      break;
    case 'onLoaded':
      onLoaded(callback, view);
      break;
    case 'onError':
      onError(callback, { view, router });
      break;
    case 'onRouterError':
      onRouterError(callback, router);
      break;
    case 'onViewError':
      onViewError(callback, view);
      break;
    default:
      break;
  }
</script>
