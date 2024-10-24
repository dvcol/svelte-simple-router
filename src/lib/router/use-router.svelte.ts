import { getContext, hasContext } from 'svelte';

import type { RouteName } from '~/models/route.model.js';

import { type IRouter, RouterContextSymbol, RouterViewSymbol } from '~/models/router.model.js';

export const hasRouter = (): boolean => {
  return hasContext(RouterContextSymbol);
};

export const useRouter = <Name extends RouteName = any>(): IRouter<Name> | undefined => {
  return getContext<IRouter<Name>>(RouterContextSymbol);
};

export const hasView = (): boolean => {
  return hasContext(RouterViewSymbol);
};

export const useView = (): string | undefined => {
  return getContext<string>(RouterViewSymbol);
};
