import type { HistoryState, NavigationGuardReturn, ResolvedRoute, RouteName, RouteNavigation, RouteQuery } from '~/models/route.model.js';
import type { RouterState } from '~/models/router.model.js';

import { NavigationAbortedError, type NavigationFailureType, ParsingRelativePathError } from '~/models/error.model.js';
import { RouterScrollConstant, RouterStateConstant } from '~/models/router.model.js';

import { toPathSegment } from '~/utils/string.utils.js';

export const routeToHistoryState = <Name extends RouteName = RouteName>(
  { route, href, query, params, name, path }: Partial<ResolvedRoute<Name>>,
  {
    metaAsState,
    nameAsTitle,
    state,
  }: {
    metaAsState?: boolean;
    nameAsTitle?: boolean;
    state?: HistoryState;
  } = {},
): {
  state: RouterState<Name>;
  title?: string;
} => {
  const title: string | undefined = route?.title ?? (nameAsTitle ? route?.name?.toString() : undefined);
  const routerState: History['state'] = {};
  if (metaAsState && route?.meta) routerState.meta = JSON.parse(JSON.stringify(route.meta));
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
    stripQuery,
    stripHash,
    stripTrailingHash,
    current = window.location.href,
  }: {
    base?: string;
    hash?: boolean;
    query?: RouteQuery;
    current?: string;
    stripQuery?: boolean;
    stripHash?: boolean;
    stripTrailingHash?: boolean;
  },
): { href: URL; search: URLSearchParams } => {
  const href = new URL(current);
  // In hash mode, we extract the query from the hash, else we use the search params
  let search: URLSearchParams;
  if (stripQuery) search = new URLSearchParams();
  else if (hash) search = new URLSearchParams(href.hash?.split('?')?.at(1)?.split('#').at(0));
  else search = href.searchParams;

  // If we have a query params, we override the current query params
  if (query) Object.entries(query).forEach(([key, value]) => search.set(key, String(value)));
  // if we have a hash, we override the current hash
  if (hash) {
    const trailingHash = href.hash.split('#')?.slice(2).join('#') ?? '';
    href.hash = `#${target}`;
    const strSearch = search.toString();
    if (strSearch) href.hash += `?${strSearch}`;
    if (trailingHash?.length && !stripTrailingHash) href.hash += `#${trailingHash}`;
    if (base) href.pathname = toPathSegment(base, true);
  } else {
    href.pathname = [base, target]
      .filter(Boolean)
      .map(s => toPathSegment(s))
      .join('');
    if (stripHash) href.hash = '';
    if (stripQuery) href.search = search.toString();
  }
  return { href, search };
};

const isRouteNavigation = <Name extends RouteName = RouteName>(navigation: unknown): navigation is RouteNavigation<Name> => {
  if (!navigation) return false;
  if (typeof navigation !== 'object') return false;
  return !!(('name' in navigation && navigation?.name) || ('path' in navigation && navigation?.path));
};

export const preventNavigation = <Name extends RouteName = RouteName>(
  result: NavigationGuardReturn<Name>,
  failure: NavigationFailureType<Name>,
): false | RouteNavigation<Name> => {
  if (result instanceof Error) throw new NavigationAbortedError(failure, { error: result });
  if (result === false) throw new NavigationAbortedError(failure);
  if (isRouteNavigation(result)) return result;
  return false;
};
