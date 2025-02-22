import { toPathSegment } from '@dvcol/common-utils/common/string';

import type { NavigationGuardReturn } from '~/models/navigation.model.js';
import type { HistoryState, RouteName, RouteNavigation, RouteQuery } from '~/models/route.model.js';
import type { ResolvedRouterLocationSnapshot, RouterState } from '~/models/router.model.js';

import { NavigationAbortedError, type NavigationFailureType } from '~/models/error.model.js';
import { replaceTitleParams } from '~/models/matcher.model.js';
import { RouterScrollConstant, RouterStateConstant } from '~/models/router.model.js';

export const routeToHistoryState = <Name extends RouteName = RouteName>(
  { route, location }: Partial<ResolvedRouterLocationSnapshot<Name>>,
  {
    metaAsState,
    nameAsTitle,
    state,
    scrollState = { x: globalThis?.scrollX, y: globalThis?.scrollY },
  }: {
    metaAsState?: boolean;
    nameAsTitle?: boolean;
    state?: HistoryState;
    scrollState?: { x: number; y: number };
  } = {},
): {
  state: RouterState<Name>;
  title?: string;
} => {
  const { href, query, params, name, path } = location ?? {};
  const _name = name ?? route?.name;
  const _path = path ?? route?.path;
  const title: string | undefined = route?.title ?? (nameAsTitle ? _name?.toString() : undefined);
  const routerState: History['state'] = {};
  if (metaAsState && route?.meta) routerState.meta = JSON.parse(JSON.stringify(route.meta));
  if (name) routerState.name = _name;
  if (path) routerState.path = _path;
  if (href) routerState.href = href.toString();
  if (query) routerState.query = query;
  if (params) routerState.params = params;

  return {
    state: {
      ...state,
      [RouterStateConstant]: routerState,
      [RouterScrollConstant]: scrollState,
    },
    title: title?.length ? replaceTitleParams(title, params) : title,
  };
};

export const resolveNewHref = (
  target: string,
  {
    base,
    hash,
    query,
    stripQuery,
    stripHash,
    stripTrailingHash,
    current = globalThis?.location.href,
  }: {
    base?: string;
    hash?: boolean;
    query?: RouteQuery;
    current?: string;
    stripQuery?: boolean;
    stripHash?: boolean;
    stripTrailingHash?: boolean;
  } = {},
): { href: URL; search: URLSearchParams } => {
  const href = new URL(current);
  // In hash mode, we extract the query from the hash, else we use the search params
  let search: URLSearchParams;
  if (stripQuery) search = new URLSearchParams();
  else if (hash) search = new URLSearchParams(href.hash?.split('?')?.at(1)?.split('#').at(0));
  else search = href.searchParams;

  // If we have a query params, we override the current query params
  if (query) Object.entries(query).forEach(([key, value]) => search.set(key, String(value)));

  const [_target, _query] = target.split('?');
  // If the target includes query params, we parse them and merge them with the current query params
  if (_query?.length) new URLSearchParams(_query).forEach((value, key) => value && search.set(key, value));

  // if we have a hash, we override the current hash
  if (hash) {
    const trailingHash = href.hash.split('#')?.slice(2).join('#') ?? '';
    href.hash = `#${_target}`;
    const strSearch = search.toString();
    if (strSearch) href.hash += `?${strSearch}`;
    if (trailingHash?.length && !stripTrailingHash) href.hash += `#${trailingHash}`;
    if (base) href.pathname = toPathSegment(base, true);
    if (href.search && !href.search?.endsWith('/')) href.search += '/';
    if (!href.search?.length && !href.pathname?.endsWith('/')) href.pathname += '/';
  } else {
    href.pathname = [base, _target]
      .filter(Boolean)
      .map(s => toPathSegment(s))
      .join('');
    if (stripHash) href.hash = '';
    if (stripQuery) href.search = search.toString();
  }
  return { href, search };
};

export const isRouteNavigation = <Name extends RouteName = RouteName>(navigation: unknown): navigation is RouteNavigation<Name> => {
  if (!navigation) return false;
  if (typeof navigation !== 'object') return false;
  return !!(('name' in navigation && navigation?.name) || ('path' in navigation && navigation?.path));
};

export const preventNavigation = <Name extends RouteName = RouteName>(
  result: NavigationGuardReturn<Name>,
  failure: NavigationFailureType<Name>,
): false | RouteNavigation<Name> => {
  if (typeof result === 'string') throw new NavigationAbortedError(failure, { message: result });
  if (result instanceof Error) throw new NavigationAbortedError(failure, { error: result });
  if (result === false) throw new NavigationAbortedError(failure);
  if (isRouteNavigation(result)) return result;
  return false;
};
