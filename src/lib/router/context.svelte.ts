import type { RouteName } from '~/models/route.model.js';
import type { IRouter, RouterOptions } from '~/models/router.model.js';
import type { IView } from '~/models/view.model.js';

import { getContext, setContext } from 'svelte';

import { Router } from '~/router/router.svelte.js';

export const RouterContextSymbol = Symbol('SvelteSimpleRouterContext');
export const RouterViewSymbol = Symbol('SvelteSimpleRouterView');

export function getRouter<Name extends RouteName = any>(): IRouter<Name> | undefined {
  return getContext<IRouter<Name>>(RouterContextSymbol);
}

export function setRouter<Name extends RouteName = any>(router?: IRouter<Name>, options?: RouterOptions<Name>): IRouter<Name> {
  return setContext(RouterContextSymbol, router ?? new Router(options));
}

export function getView<Name extends RouteName = any>(): IView<Name> {
  return getContext<IView<Name>>(RouterViewSymbol);
}

export function setView<Name extends RouteName = any>(view: IView<Name>): IView<Name> {
  return setContext(RouterViewSymbol, view);
}
