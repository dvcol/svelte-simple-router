<script lang="ts">
  import type {
    ErrorListener,
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
  } = $props();

  switch (name) {
    case 'beforeEach':
      beforeEach(callback);
      break;
    case 'onStart':
      onStart(callback);
      break;
    case 'onEnd':
      onEnd(callback);
      break;
    case 'onChange':
      onChange(callback);
      break;
    case 'onLoading':
      onLoading(callback);
      break;
    case 'onLoaded':
      onLoaded(callback);
      break;
    case 'onError':
      onError(callback);
      break;
    case 'onRouterError':
      onRouterError(callback);
      break;
    case 'onViewError':
      onViewError(callback);
      break;
    default:
      break;
  }
</script>
