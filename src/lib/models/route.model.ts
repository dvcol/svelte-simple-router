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
export type RouteParams = Record<string, RouteParamValue>;
export type RouteQuery = Record<string, RouteParamValue>;

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
  /**
   * Name is forbidden in this case.
   */
  name?: never;
};

export type RouteName = string | number | symbol;

export type RouteNameNavigation<Name extends RouteName = string> = CommonRouteNavigation & {
  /**
   * Name of the route.
   */
  name: Name;
  /**
   * Path is forbidden in this case.
   */
  path?: never;
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
   * Loading component to display while the component is being loaded.
   */
  loading?: Component;
  /**
   * Error component to display if the component fails to load.
   */
  error?: Component;
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
};

export type RouteComponents<Name extends RouteName = string> = {
  /**
   * Components to display when the URL matches this route.
   */
  components: Record<Name, ComponentOrLazy>;
  /**
   * Loading components to display while the components are being loaded.
   */
  loadings?: Record<Name, Component>;
  /**
   * Error components to display if the components fail to load.
   */
  errors?: Record<Name, Component>;
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
  /**
   * Loading component is forbidden in this case.
   */
  loading?: never;
  /**
   * Error component is forbidden in this case.
   */
  error?: never;
};

export type RouteRedirect = {
  /**
   * Where to redirect if the route is directly matched. The redirection happens
   * before any navigation guard and triggers a new navigation with the new
   * target location.
   */
  redirect?: RouteNavigation;
  /**
   * Props are forbidden in this case.
   */
  props?: never;
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
};