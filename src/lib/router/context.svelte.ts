import type { RouteName } from '~/models/route.model.js';
import type { IRouter } from '~/models/router.model.js';
import type { IView } from '~/models/view.model.js';

import { getContext, setContext } from 'svelte';

export const RouterContextSymbol = Symbol('SvelteSimpleRouterContext');
export const RouterViewSymbol = Symbol('SvelteSimpleRouterView');

export function getRouter<Name extends RouteName = any>(): IRouter<Name> | undefined {
  return getContext<IRouter<Name>>(RouterContextSymbol);
}

export function setRouter<Name extends RouteName = any>(router: IRouter<Name>): IRouter<Name> {
  return setContext(RouterContextSymbol, router);
}

export function getView<Name extends RouteName = any>(): IView<Name> {
  return getContext<IView<Name>>(RouterViewSymbol);
}

export function setView<Name extends RouteName = any>(view: IView<Name>): IView<Name> {
  return setContext(RouterViewSymbol, view);
}
