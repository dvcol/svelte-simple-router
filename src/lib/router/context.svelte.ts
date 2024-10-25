import { getContext, setContext } from 'svelte';

import type { RouteName } from '~/models/route.model.js';

import { type IRouter } from '~/models/router.model.js';

export const RouterContextSymbol = Symbol('SvelteSimpleRouterContext');
export const RouterViewSymbol = Symbol('SvelteSimpleRouterView');

export const getRouter = <Name extends RouteName = any>(): IRouter<Name> | undefined => {
  return getContext<IRouter<Name>>(RouterContextSymbol);
};

export const setRouter = <Name extends RouteName = any>(router: IRouter<Name>): IRouter<Name> => {
  return setContext(RouterContextSymbol, router);
};

export const getView = (): string | undefined => {
  return getContext<string>(RouterViewSymbol);
};

export const setView = (view: string): string => {
  return setContext(RouterViewSymbol, view);
};
