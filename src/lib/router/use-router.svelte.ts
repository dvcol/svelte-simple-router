import { getContext, hasContext } from 'svelte';

import type { RouteName } from '~/models/route.model.js';

import { MissingRouterContextError } from '~/models/index.js';
import { type IRouter } from '~/models/router.model.js';
import { getRouter, RouterContextSymbol, RouterViewSymbol } from '~/router/context.svelte.js';

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

export const useView = (): string | undefined => {
  if (!hasRouter()) throw new MissingRouterContextError();
  return getContext<string>(RouterViewSymbol);
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

export const useNavigation = <Name extends RouteName = any>() => {
  const router = useRouter<Name>();
  if (!router) throw new MissingRouterContextError();

  return {
    beforeEach: router.beforeEach.bind(router),
    onError: router.onError.bind(router), // merge with view.onError
    onStart: router.onStart.bind(router),
    onEnd: router.onEnd.bind(router),
    // onLoading TODO: Add onLoading
    // onLoaded TODO: Add onLoaded
  };
};
