import type { HistoryState, ResolvedRoute, RouteName, RouteQuery } from '~/models/route.model.js';
import type { RouterState } from '~/models/router.model.js';

import { ParsingRelativePathError } from '~/models/error.model.js';
import { RouterScrollConstant, RouterStateConstant } from '~/models/router.model.js';

export const routeToHistoryState = <Name extends RouteName = RouteName>(
  { route, href, query, params, name, path }: Partial<ResolvedRoute<Name>>,
  {
    metaAsState,
    nameAsTitle,
    state,
  }: {
    metaAsState?: boolean;
    nameAsTitle?: boolean;
    restoreScroll?: boolean;
    state?: HistoryState;
  } = {},
): {
  state: RouterState<Name>;
  title?: string;
} => {
  const title: string | undefined = route?.title ?? (nameAsTitle ? route?.name?.toString() : undefined);
  const routerState: History['state'] = {};
  if (metaAsState && route?.meta) routerState.meta = route.meta;
  if (name) routerState.name = name;
  if (path) routerState.path = path;
  if (href) routerState.href = href.toString();
  if (query) routerState.query = query;
  if (params) routerState.params = params;

  return {
    state: {
      ...state,
      [RouterStateConstant]: routerState,
      [RouterScrollConstant]: { x: window.scrollX, y: window.scrollY },
    },
    title,
  };
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
    base,
    hash,
    query,
    current = window.location.href,
  }: {
    base?: string;
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
    href.pathname = [base, target].filter(Boolean).join('/');
  }
  return { href, search };
};
