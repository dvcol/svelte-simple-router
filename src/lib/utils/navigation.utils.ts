import { type HistoryState, ParsingRelativePathError, type ResolvedRouterLocation, type RouteQuery } from '../models/index.js';

import type { RouteName } from '~/models/route.model.js';

import { RouterStateScrollSymbol, RouterStateSymbol } from '~/models/router.model.js';

export const routeToHistoryState = <Name extends RouteName = string>(
  { route, location }: ResolvedRouterLocation<Name> = {},
  {
    metaAsState,
    nameAsTitle,
    restoreScroll,
    state,
  }: {
    metaAsState?: boolean;
    nameAsTitle?: boolean;
    restoreScroll?: boolean;
    state?: HistoryState;
  } = {},
) => {
  const title: string | undefined = route?.title ?? (nameAsTitle ? route?.name?.toString() : undefined);
  const routerState: History['state'] = {};
  if (restoreScroll) routerState[RouterStateScrollSymbol] = { x: window.scrollX, y: window.scrollY };
  if (metaAsState && route?.meta) routerState.meta = route.meta;
  if (route?.name) routerState.name = route.name;
  if (route?.path) routerState.path = route.path;
  if (location?.href) routerState.href = location.href;
  if (location?.query) routerState.query = location.query;
  if (location?.params) routerState.params = location.params;
  return { state: { ...state, [RouterStateSymbol]: routerState }, title };
};

export const computeAbsolutePath = (parent: string, relative: string) => {
  const relativeSegments = relative.split('/').filter(Boolean);
  const parentSegments = parent.split('/').filter(Boolean);
  relativeSegments.forEach(segment => {
    if (segment === '..' && parentSegments.length < 1) throw new ParsingRelativePathError({ parent, relative });
    else if (segment === '..') parentSegments.pop();
    else if (segment !== '.') parentSegments.push(segment);
  });
  return `/${parentSegments.join('/')}`;
};

export const resolveNewHref = (
  target: string,
  {
    hash,
    query,
    current = window.location.href,
  }: {
    hash?: boolean;
    query?: RouteQuery;
    current?: string;
  },
): { href: URL; search: URLSearchParams } => {
  const href = new URL(current);
  // In hash mode, we extract the query from the hash, else we use the search params
  const search = hash ? new URLSearchParams(href.hash?.split('?')?.at(1)) : href.searchParams;
  // If we have a query params, we override the current query params
  if (query) Object.entries(query).forEach(([key, value]) => search.set(key, String(value)));
  // if we have a hash, we override the current hash
  if (hash) {
    href.hash = `#${target}`;
    const strSearch = search.toString();
    if (strSearch) href.hash += `?${strSearch}`;
  } else {
    href.pathname = target;
  }
  return { href, search };
};
