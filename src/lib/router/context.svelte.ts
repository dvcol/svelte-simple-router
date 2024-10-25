import { getContext, setContext } from 'svelte';

import type { RouteName } from '~/models/route.model.js';

import type { IView } from '~/models/view.model.js';

import { type IRouter } from '~/models/router.model.js';

export const RouterContextSymbol = Symbol('SvelteSimpleRouterContext');
export const RouterViewSymbol = Symbol('SvelteSimpleRouterView');

export const getRouter = <Name extends RouteName = any>(): IRouter<Name> | undefined => {
  return getContext<IRouter<Name>>(RouterContextSymbol);
};

export const setRouter = <Name extends RouteName = any>(router: IRouter<Name>): IRouter<Name> => {
  return setContext(RouterContextSymbol, router);
};

export const getView = <Name extends RouteName = any>(): IView<Name> => {
  return getContext<IView<Name>>(RouterViewSymbol);
};

export const setView = <Name extends RouteName = any>(view: IView<Name>): IView<Name> => {
  return setContext(RouterViewSymbol, view);
};
