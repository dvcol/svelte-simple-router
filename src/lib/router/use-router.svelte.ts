import { hasContext } from 'svelte';

import type { RouteName } from '~/models/route.model.js';

import type { IView } from '~/models/view.model.js';

import { MissingRouterContextError, MissingViewContextError } from '~/models/index.js';
import { type IRouter } from '~/models/router.model.js';
import { getRouter, getView, RouterContextSymbol, RouterViewSymbol } from '~/router/context.svelte.js';

export const hasRouter = (): boolean => {
  return hasContext(RouterContextSymbol);
};

export const useRouter = <Name extends RouteName = any>(): IRouter<Name> => {
  const router = getRouter<Name>();
  if (!router) throw new MissingRouterContextError();
  return router;
};

export const hasView = (): boolean => {
  return hasContext(RouterViewSymbol);
};

export const useView = <Name extends RouteName = any>(): IView<Name> => {
  if (!hasView()) throw new MissingViewContextError();
  return getView<Name>();
};

export const useRoute = <Name extends RouteName = any>(): Pick<IRouter<Name>, 'route' | 'location' | 'routing'> => {
  const router = useRouter<Name>();
  return {
    route: router.route,
    location: router.location,
    routing: router.routing,
  };
};

export const useNavigate = <Name extends RouteName = any>(): Pick<IRouter<Name>, 'push' | 'replace' | 'resolve' | 'back' | 'forward' | 'go'> => {
  const router = useRouter<Name>();
  return {
    resolve: router.resolve.bind(router),
    push: router.push.bind(router),
    replace: router.replace.bind(router),
    back: router.back.bind(router),
    forward: router.forward.bind(router),
    go: router.go.bind(router),
  };
};

export const useRouterHooks = <Name extends RouteName = any>() => {
  const router = useRouter<Name>();
  return {
    beforeEach: router.beforeEach.bind(router),
    onStart: router.onStart.bind(router),
    onEnd: router.onEnd.bind(router),
    onError: router.onError.bind(router),
  };
};

export const useViewHooks = <Name extends RouteName = any>() => {
  const view = useView<Name>();
  return {
    onLoading: view.onLoading.bind(view),
    onLoaded: view.onLoaded.bind(view),
    onError: view.onError.bind(view),
  };
};
