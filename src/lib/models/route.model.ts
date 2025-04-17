import type { AnyComponent, ComponentOrLazy } from '@dvcol/svelte-utils/component';
import type { Snippet } from 'svelte';

import type { IMatcher } from '~/models/matcher.model.js';
import type { NavigationGuard, ResolveGuard } from '~/models/navigation.model.js';
import type { IDefaultView } from '~/models/view.model.js';

import { isShallowEqual, shallowClone } from '@dvcol/common-utils/common/object';

/**
 * Allowed variables in HTML5 history state. Note that pushState clones the state
 * passed and does not accept everything: e.g.: it doesn't accept symbols, nor
 * functions as values. It also ignores Symbols as keys.
 *
 */
export type HistoryStateValue<Key extends string | number = string | number> = string | number | boolean | null | undefined | HistoryState<Key> | HistoryState<Key>[];

/**
 * Allowed HTML history.state
 */
export type HistoryState<Key extends string | number = string | number> = {
  [x in Key]: HistoryStateValue<Key>;
};

export type RouteParamValue = string | number | boolean;
export type RouteQuery = Record<string, RouteParamValue>;
export type RouteParams = Record<string, RouteParamValue>;
export type RouteWildcards = Record<string, string>;

export interface RouteNavigationOptions {
  /**
   * Strip current query parameters when navigating.
   * @default false
   */
  stripQuery?: boolean;
  /**
   * Strip current hash when navigating when hash mode is disabled.
   * This is only used in path mode.
   * @default false
   */
  stripHash?: boolean;
  /**
   * Strip trailing hash from the new href (i.e. only keep one url fragment used for routing).
   * This is only used in hash mode.
   * @default false
   */
  stripTrailingHash?: boolean;
}

export type CommonRouteNavigation = RouteNavigationOptions & {
  /**
   * Query parameters of the location.
   */
  query?: RouteQuery;
  /**
   * Params of the location.
   */
  params?: RouteParams;
  /**
   * State to save using the History API.
   * This cannot contain any reactive values and some primitives like Symbols are forbidden.
   *
   * @see [MDN for more information](https://developer.mozilla.org/en-US/docs/Web/API/History/state)
   */
  state?: HistoryState;
};

/**
 * Record used to navigate to a new location.
 */
export type RouteLocationNavigation = CommonRouteNavigation & {
  /**
   * Path of the location.
   */
  path: string;
  /**
   * Name is forbidden in this case.
   */
  name?: never;
};

export type RouteName = string | number | symbol;

export type RouteNameNavigation<Name extends RouteName = RouteName> = CommonRouteNavigation & {
  /**
   * Name of the route.
   */
  name: Name;
  /**
   * Path is forbidden in this case.
   */
  path?: never;
};

export type RouteNavigation<Name extends RouteName = RouteName> = RouteLocationNavigation | RouteNameNavigation<Name>;

export type ComponentProps = Record<RouteName, unknown>;

export interface RouteComponent {
  /**
   * Component to display when the URL matches this route.
   */
  component: ComponentOrLazy | Snippet;
  /**
   * Loading component to display while the component is being loaded.
   */
  loading?: AnyComponent | Snippet;
  /**
   * Error component to display if the component fails to load.
   */
  error?: AnyComponent | Snippet;
  /**
   * Allow passing down params as props to the component rendered by `router`.
   */
  props?: ComponentProps;
  /**
   * Redirect is forbidden in this case.
   */
  redirect?: never;
  /**
   * Components are forbidden in this case.
   */
  components?: never;
  /**
   * Loading components are forbidden in this case.
   */
  loadings?: never;
  /**
   * Error components are forbidden in this case.
   */
  errors?: never;
  /**
   * Properties are forbidden in this case.
   */
  properties?: never;
}

export interface RouteComponents<Name extends RouteName = RouteName> {
  /**
   * Components to display when the URL matches this route.
   */
  components: Partial<Record<Name | IDefaultView, ComponentOrLazy | Snippet>>;
  /**
   * Loading components to display while the components are being loaded.
   */
  loadings?: Partial<Record<Name | IDefaultView, AnyComponent | Snippet>>;
  /**
   * Error components to display if the components fail to load.
   */
  errors?: Partial<Record<Name | IDefaultView, AnyComponent | Snippet>>;
  /**
   * Allow passing down params as props to the component rendered by `router`.
   */
  properties?: Partial<Record<Name | IDefaultView, ComponentProps>>;
  /**
   * Redirect is forbidden in this case.
   */
  redirect?: never;
  /**
   * Component is forbidden in this case.
   */
  component?: never;
  /**
   * Loading component is forbidden in this case.
   */
  loading?: never;
  /**
   * Error component is forbidden in this case.
   */
  error?: never;
  /**
   * Props are forbidden in this case.
   */
  props?: never;
}

export interface RouteRedirect<Name extends RouteName = RouteName> {
  /**
   * Where to redirect if the route is directly matched. The redirection happens
   * before any navigation guard and triggers a new navigation with the new
   * target location.
   */
  redirect: RouteNavigation<Name>;
  /**
   * Props are forbidden in this case.
   */
  props?: never;
  /**
   * Properties are forbidden in this case.
   */
  properties?: never;
  /**
   * Component is forbidden in this case.
   */
  component?: never;
  /**
   * Components are forbidden in this case.
   */
  components?: never;
  /**
   * Loading component is forbidden in this case.
   */
  loading?: never;
  /**
   * Loading components are forbidden in this case.
   */
  loadings?: never;
  /**
   * Error component is forbidden in this case.
   */
  error?: never;
  /**
   * Error components is forbidden in this case.
   */
  errors?: never;
}

export interface BaseRoute<Name extends RouteName = RouteName> {
  /**
   * Path of the record.
   *
   * Should start with `/` unless the record is the child of another record.
   *
   * Supports:
   * - wildcards `*`
   * - parameters `:param`.
   * - optional parameters `:param:?`.
   * - typed parameters `:{string}:param` or `:{number}:param`.
   *
   * @example `/users/:id` matches `/users/1` as well as `/users/name`.
   */
  path: string;
  /**
   * Name for the route record. Must be unique.
   */
  name?: Name;
  /**
   * Title of the route record. Used for the document title.
   *
   * Supports:
   * - parameters `:param`.
   * - optional parameters `:param:?`.
   * - typed parameters `:{string}:param` or `:{number}:param`.
   *
   * Note: Parameters need to match the following regex: `/:(\w|[:?{}])+/g`.
   *
   * @example `:count:? My Title :route:?` with parameters `{ count: '(1) ', route: '- home' }` will render `(1) My Title - home`.
   */
  title?: string;
  /**
   * Arbitrary data attached to the record.
   */
  meta?: Record<RouteName, unknown>;
  /**
   * Default, query parameters to inject in the url when navigating to this route.
   * Note that query passed in navigation events will override these.
   */
  query?: RouteQuery;
  /**
   * Default, params to inject in the url when navigating to this route.
   * Note that params passed in navigation events will override these.
   */
  params?: RouteParams;
}

interface RouteLogic<Name extends RouteName = RouteName> {
  /**
   * Array of nested routes.
   */
  children?: Route<Name>[];
  /**
   * Parent route record.
   */
  parent?: Route<Name>;
  /**
   * Matcher function to match the route to a location.
   */
  matcher?: IMatcher;
  /**
   * Before resolve guard specific to this record.
   * @awaited
   */
  beforeResolve?: ResolveGuard<Name>;
  /**
   * Before Enter guard specific to this record.
   * @awaited
   */
  beforeEnter?: NavigationGuard<Name>;
  /**
   * Before Leave guard specific to this record.
   * @awaited
   */
  beforeLeave?: NavigationGuard<Name>;
}

export type Route<Name extends RouteName = RouteName> = BaseRoute<Name> &
  RouteLogic<Name> &
  (RouteRedirect<Name> | RouteComponent | RouteComponents<Name>);

export type PartialRoute<Name extends RouteName = RouteName> = BaseRoute<Name> &
  RouteLogic<Name> &
  Partial<RouteRedirect<Name> | RouteComponent | RouteComponents<Name>>;

export function cloneRoute<Name extends RouteName = RouteName>(route: Route<Name>): Route<Name> {
  return shallowClone<Route<Name>, keyof Route<Name>>(route, 2, ['parent', 'component', 'components', 'loading', 'loadings', 'error', 'errors']);
}

export const isRouteEqual = <Name extends RouteName = RouteName>(a?: Route<Name>, b?: Route<Name>): boolean => isShallowEqual(a, b, 2);

export function toBaseRoute<Name extends RouteName = RouteName>(route?: Route<Name>): BaseRoute<Name> | undefined {
  if (!route) return route;
  return {
    path: route.path,
    name: route.name,
    title: route.title,
    meta: { ...route.meta },
    query: { ...route.query },
    params: { ...route.params },
  };
}

export type ParsedRoute<Name extends RouteName = RouteName> = Route<Name> & { parent?: ParsedRoute<Name>; matcher: IMatcher };

export interface ResolvedRoute<Name extends RouteName = RouteName> {
  /**
   * Matched route record if any.
   */
  route?: ParsedRoute<Name>;
  /**
   * Name of the resolved route record.
   */
  name?: Name;
  /**
   * Resolved path with query and params.
   */
  path: string;
  /**
   * Full matched path including parents and base.
   */
  href: URL;
  /**
   * Query parameters of the location.
   */
  query: RouteQuery;
  /**
   * Params of the location.
   */
  params: RouteParams;
  /**
   * Wildcards parsed from the path.
   */
  wildcards: RouteWildcards;
}
