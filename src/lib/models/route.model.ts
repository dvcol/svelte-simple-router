import type { Component } from 'svelte';

/**
 * Allowed variables in HTML5 history state. Note that pushState clones the state
 * passed and does not accept everything: e.g.: it doesn't accept symbols, nor
 * functions as values. It also ignores Symbols as keys.
 *
 */
export type HistoryStateValue = string | number | boolean | null | undefined | HistoryState | HistoryState[];

/**
 * Allowed HTML history.state
 */
export type HistoryState = {
  [x: number]: HistoryStateValue;
  [x: string]: HistoryStateValue;
};

export type RouteParamValue = string | number | boolean;
export type RouteParams = Record<string, RouteParamValue | RouteParamValue[]>;
export type RouteQuery = Record<string, RouteParamValue | RouteParamValue[] | undefined>;

/**
 * Common options for all navigation methods.
 */
export type RouteNavigateOptions = {
  /**
   * Replace the entry in the history instead of pushing a new entry
   */
  replace?: boolean;
  /**
   * Triggers the navigation even if the location is the same as the current one.
   * Note this will also add a new entry to the history unless `replace: true`
   * is passed.
   *
   * @todo This is not yet implemented.
   */
  force?: boolean;
};

export type CommonRouteNavigation = {
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
};

export type RouteName = string | number | symbol;

export type RouteNameNavigation<Name extends RouteName = string> = CommonRouteNavigation & {
  /**
   * Name of the route.
   */
  name: Name;
};

export type RouteNavigation<Name extends RouteName = string> = RouteLocationNavigation | RouteNameNavigation<Name>;

export type ComponentOrLazy = Component | (() => Promise<{ default: Component }>);
export type ComponentProps = Record<RouteName, unknown>;

export type RouteComponent = {
  /**
   * Component to display when the URL matches this route.
   */
  component: ComponentOrLazy;
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
};

export type RouteComponents<Name extends RouteName = string> = {
  /**
   * Components to display when the URL matches this route.
   */
  components: Record<Name, RouteComponent>;
  /**
   * Allow passing down params as props to the component rendered by `router`.
   */
  props?: Record<Name, ComponentProps>;
  /**
   * Redirect is forbidden in this case.
   */
  redirect?: never;
  /**
   * Component is forbidden in this case.
   */
  component?: never;
};

export type RouteRedirect = {
  /**
   * Where to redirect if the route is directly matched. The redirection happens
   * before any navigation guard and triggers a new navigation with the new
   * target location.
   */
  redirect?: RouteNavigation;
  /**
   * Component is forbidden in this case.
   */
  component?: never;
  /**
   * Components are forbidden in this case.
   */
  components?: never;
  /**
   * Props are forbidden in this case.
   */
  props?: never;
};

export type NavigationGuardReturn<Name extends RouteName = string> = void | boolean | Error | RouteNavigation<Name>;

export type NavigationGuard<Name extends RouteName = string> = (
  from: Route<Name>,
  to: Route<Name>,
) => NavigationGuardReturn<Name> | Promise<NavigationGuardReturn<Name>>;

export type NavigationListener<Name extends RouteName = string> = (from: Route<Name>, to: Route<Name>) => void;

export type Route<Name extends RouteName = string> = (RouteRedirect | RouteComponent | RouteComponents<Name>) & {
  /**
   * Path of the record. Should start with `/` unless the record is the child of
   * another record.
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
   */
  title?: string;
  /**
   * Before Enter guard specific to this record.
   */
  beforeEnter?: NavigationGuard<Name>;
  /**
   * Before Leave guard specific to this record.
   */
  beforeLeave?: NavigationGuard<Name>;
  /**
   * Arbitrary data attached to the record.
   */
  meta?: Record<RouteName, unknown>;
  /**
   * Array of nested routes.
   */
  children?: Route[];
};

export type ResolvedRoute<Name extends RouteName = string> = {
  /**
   * Matched route record if any.
   */
  route?: Route<Name>;
  /**
   * Resolved path with query and params.
   */
  path: string;
  /**
   * Full matched path including parents and base.
   */
  href: string;
};
