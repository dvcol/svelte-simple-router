/// <reference types="navigation-api-types" />

import { isShallowEqual } from '@dvcol/common-utils/common/object';

import type { Snippet } from 'svelte';
import type { TransitionConfig } from 'svelte/transition';

import type {
  BaseRoute,
  HistoryState,
  NavigationGuard,
  ParsedRoute,
  PartialRoute,
  ResolvedRoute,
  Route,
  RouteName,
  RouteNavigation,
  RouteNavigationOptions,
  RouteParams,
  RouteQuery,
  RouteWildcards,
} from '~/models/route.model.js';

import type { LogLevel } from '~/utils/logger.utils.js';

import { NavigationAbortedError, NavigationCancelledError } from '~/models/error.model.js';
import { isRouteEqual, toBaseRoute } from '~/models/route.model.js';

import { Logger } from '~/utils/index.js';

export type RouterLocation<Name extends RouteName = RouteName> = {
  origin: string;
  base?: string;
  name?: Name;
  path: string;
  href: URL;
  query: RouteQuery;
  params: RouteParams;
  wildcards: RouteWildcards;
};

export const isLocationEqual = <Name extends RouteName = RouteName>(a?: RouterLocation<Name>, b?: RouterLocation<Name>): boolean =>
  isShallowEqual(a, b, 2);

export type BasicRouterLocation<Name extends RouteName = RouteName> = Omit<RouterLocation<Name>, 'href'> & { href: string };
export const toBasicRouterLocation = <Name extends RouteName = RouteName>(loc?: RouterLocation<Name>): BasicRouterLocation<Name> | undefined => {
  if (!loc) return loc;
  return {
    origin: loc.origin,
    base: loc.base,
    name: loc.name,
    path: loc.path,
    href: loc.href.toString(),
    query: { ...loc.query },
    params: { ...loc.params },
    wildcards: { ...loc.wildcards },
  };
};

export type ResolvedRouterLocation<Name extends RouteName = RouteName> = {
  route?: Route<Name>;
  location?: RouterLocation<Name>;
};

export type ResolvedRouterLocationSnapshot<Name extends RouteName = RouteName> = {
  route?: BaseRoute<Name>;
  location?: BasicRouterLocation<Name>;
};

export const isResolvedLocationEqual = <Name extends RouteName = RouteName>(
  a: ResolvedRouterLocation<Name>,
  b: ResolvedRouterLocation<Name>,
): boolean => isRouteEqual(a?.route, b?.route) && isLocationEqual(a?.location, b?.location);

export const RouterStateConstant = '__SVELTE_SIMPLE_ROUTER_STATE__' as const;
export const RouterScrollConstant = '__SVELTE_SIMPLE_ROUTER_SCROLL__' as const;
export const RouterDebuggerConstant = '__SVELTE_SIMPLE_ROUTER_DEBUGGER__' as const;

export type RouterContextProps<Name extends RouteName = any> = {
  /**
   * Router instance to use.
   */
  router?: IRouter<Name>;
  /**
   * Router options to use when creating a new router instance.
   */
  options?: RouterOptions<Name>;
  /**
   * Children to render when the router is ready.
   */
  children?: Snippet<[IRouter<Name>]>;
};

export type TransitionFunction<T extends Record<string, any> | undefined = Record<string, any> | undefined> = (
  node: Element,
  props: T,
  options: { direction: 'in' | 'out' },
) => TransitionConfig | (() => TransitionConfig);

export type TransitionProps<
  T extends { in?: Record<string, any>; out?: Record<string, any> } = { in?: Record<string, any>; out?: Record<string, any> },
> = {
  /**
   * Skip the first enter transition.
   * This is useful when the first route load is fast and the transition is not needed.
   * @default true
   */
  skipFirst?: boolean;
  /**
   * If `true`, the transition will be updated on any route change.
   * By default, the transition is only triggered when the component changes to avoid unnecessary mounting and unmounting.
   *
   * @default false
   */
  updateOnRouteChange?: boolean;
  /**
   * Transition to use when navigating to a new route.
   */
  in?: TransitionFunction<T['in']>;
  /**
   * Transition to use when navigating away from the current route.
   */
  out?: TransitionFunction<T['out']>;
  /**
   * Transition parameters to be passed to the transition functions.
   */
  params?: {
    in?: T['in'];
    out?: T['out'];
  };
  props?: {
    container?: Record<string, any>;
    wrapper?: Record<string, any>;
  };
  /**
   * If `true`, component will be wrapped in a div with `view-transition-name: <router-id>-<route-name>` to allow view transitions.
   */
  viewTransitionApi?: boolean;
};

export type ResolvedRouteSnapshot<Name extends RouteName = RouteName> = Omit<ResolvedRoute<Name>, 'route'> & {
  route: BaseRoute<Name>;
};

export type INavigationEventState<Name extends RouteName = RouteName> = {
  readonly active: boolean;
  readonly failed: boolean | unknown;
  readonly cancelled: boolean;
  readonly completed: boolean;
  readonly redirected: boolean | RouteNavigation<Name>;
};

export type INavigationEvent<Name extends RouteName = RouteName> = INavigationEventState<Name> & {
  readonly to: ResolvedRouteSnapshot<Name>;
  readonly from: ResolvedRouterLocationSnapshot<Name>;
  readonly uuid: string;
  readonly result: Promise<NavigationEventStatus>;
  readonly status: NavigationEventStatus;
};

type NavigationEventStatus = keyof INavigationEventState;

export class NavigationEvent<Name extends RouteName = RouteName> implements INavigationEvent<Name> {
  readonly to: ResolvedRouteSnapshot<Name>;
  readonly from: ResolvedRouterLocationSnapshot<Name>;
  readonly uuid: string;
  readonly result: Promise<NavigationEventStatus>;

  readonly #resolve: (status: NavigationEventStatus) => void;
  readonly #reject: (error: unknown) => void;

  #status: NavigationEventStatus = 'active';
  #error?: unknown;
  #redirect?: RouteNavigation<Name>;

  get status(): NavigationEventStatus {
    return this.#status;
  }

  get active(): boolean {
    return this.#status === 'active';
  }

  get completed(): boolean {
    return this.#status === 'completed';
  }

  get cancelled(): boolean {
    return this.#status === 'cancelled';
  }

  get failed(): unknown | boolean {
    return this.#error ?? this.#status === 'failed';
  }

  get redirected(): RouteNavigation<Name> | boolean {
    return this.#redirect ?? this.#status === 'redirected';
  }

  constructor(to: ResolvedRoute<Name>, from: ResolvedRouterLocationSnapshot<Name>) {
    this.uuid = crypto.randomUUID();
    this.to = { ...to, route: toBaseRoute(to.route)! };
    this.from = from;

    const { promise, resolve, reject } = Promise.withResolvers<NavigationEventStatus>();
    this.result = promise;
    this.#resolve = resolve;
    this.#reject = reject;
  }

  redirect(to: RouteNavigation<Name>): void {
    if (!this.active) return Logger.error('Cannot redirect a navigation event that is not active', this);
    this.#status = 'redirected';
    this.#redirect = to;
    this.#resolve(this.#status);
  }

  complete(): void {
    if (!this.active) return Logger.error('Cannot complete a navigation event that is not active', this);
    this.#status = 'completed';
    this.#resolve(this.#status);
  }

  /**
   * Cancel the current navigation event.
   * @throws {@link NavigationCancelledError}
   */
  cancel(error?: unknown): void {
    if (!this.active) return Logger.error('Cannot cancel a navigation event that is not active', this);
    this.#status = 'cancelled';
    this.#error = error;
    this.#reject(this.#status);
    if (error instanceof NavigationCancelledError) throw error;
    throw new NavigationCancelledError(this, { error });
  }

  /**
   * Fail the current navigation event.
   * @param error - Error to throw
   * @throws {@link NavigationAbortedError}
   */
  fail(error?: unknown): void {
    if (!this.active) return Logger.error('Cannot fail a navigation event that is not active', this);
    this.#status = 'failed';
    this.#error = error;
    this.#reject(this.#status);
    if (error instanceof NavigationAbortedError) throw error;
    throw new NavigationAbortedError(this, { error });
  }
}

export type NavigationListener<Name extends RouteName = RouteName> = (navigation: INavigationEvent<Name>) => void;

export type NavigationEndListener<Name extends RouteName = RouteName> = (
  navigation: INavigationEvent<Name>,
  resolved: ResolvedRouterLocationSnapshot<Name>,
) => void;

export type NavigationErrorListener<Name extends RouteName = RouteName> = (
  navigation: Error | unknown,
  context: Partial<INavigationEvent<Name>> & { route?: BaseRoute<Name> },
) => void;

export type LoadingListener<Name extends RouteName = RouteName> = (route?: BaseRoute<Name>) => void;

export type RouteContainerProps<Name extends RouteName = any> = {
  /**
   * Name of the router view to render.
   * If not provided, the default view will be used.
   */
  name?: string;
  /**
   * Transition to use when navigating between routes.
   */
  transition?: TransitionProps;
  /**
   * Navigation guard passed to the router instance.
   */
  beforeEach?: NavigationGuard<Name>;
  /**
   * Loading listener to execute when the view starts loading.
   */
  onLoading?: LoadingListener<Name>;
  /**
   * Loaded listener to execute when the view is loaded.
   */
  onLoaded?: LoadingListener<Name>;
  /**
   * Error listener to execute when the view fails to load.
   */
  onError?: NavigationErrorListener<Name>;
  /**
   * Navigation listener passed to the router instance.
   */
  onStart?: NavigationListener<Name>;
  /**
   * Navigation end listener passed to the router instance.
   */
  onEnd?: NavigationEndListener<Name>;
  /**
   * Routing snippet to display while the route is being resolved.
   */
  routing?: Snippet<[IRouter<Name>['routing']]>;
  /**
   * Loading snippet to display while the route is loading.
   * Route loading component will take precedence over this.
   *
   * @see {@link RouteComponents.loadings}
   * @see {@link RouteComponent.loading}
   */
  loading?: Snippet<[IRouter<Name>['route']]>;
  /**
   * Error snippet to display if the route fails to load.
   * Route error component will take precedence over this.
   *
   * @see {@link RouteComponents.errors}
   * @see {@link RouteComponent.error}
   */
  error?: Snippet<[Error | any]>;
};

export type RouterViewProps<Name extends RouteName = any> = RouterContextProps<Name> & RouteContainerProps<Name>;
export type RouteViewProps<Name extends RouteName = any> = Pick<RouterViewProps<Name>, 'loading' | 'error' | 'name'> & {
  /**
   * Route to inject into the router.
   */
  route: PartialRoute<Name>;
  /**
   * Children to render when the router is ready.
   */
  children?: Snippet;
} & Partial<Record<Name, Route<Name>['component']>>;

export type RouterScrollPosition = { x: number; y: number };
export type RouterStateLocation<Name extends RouteName = RouteName> = {
  meta?: Route<Name>['meta'];
  name?: Route<Name>['name'];
  path?: Route<Name>['path'];
  href?: RouterLocation<Name>['href'];
  query?: RouterLocation<Name>['query'];
  params?: RouterLocation<Name>['params'];
};
export type RouterState<Name extends RouteName = RouteName> = HistoryState & {
  [RouterStateConstant]?: RouterStateLocation<Name>;
  [RouterScrollConstant]?: RouterScrollPosition;
};

export type IHistory<Name extends RouteName = RouteName, T extends RouterState<Name> = RouterState<Name>> = History & {
  state: T;
  pushState: (state: T, title: string, url?: string | null) => void;
  replaceState: (state: T, title: string, url?: string | null) => void;
};

/**
 * Options used to navigate to a route.
 */
export type RouterNavigationOptions = {
  /**
   * Base URL from which the app is served.
   * Used to resolve route in a subdomain context.
   */
  base?: string;
  /**
   * If `true`, the router will use the hash portion of the URL for routing.
   *
   * @default false
   */
  hash?: boolean;
  /**
   * If `true`, the router will match the routes strictly (i.e. /path will not match /path/child).
   *
   * @default false
   */
  strict?: boolean;
  /**
   * If `true`, the router will reload the current route even if the current route is the same as the target route.
   */
  force?: boolean;
  /**
   * If `true`, the router will throw an error if the route is not found during navigation, resolve, push or replace state.
   *
   * @default false
   */
  failOnNotFound?: boolean;
  /**
   * If `true`, the router will push the `meta` property of the route to the state.
   * Warning: Depending on the history implementation, the state may not hold any reactive values and some primitives like Symbols are forbidden.
   *
   * @see [MDN for more information](https://developer.mozilla.org/en-US/docs/Web/API/History/state)
   *
   * @default false
   */
  metaAsState?: boolean;
  /**
   * If `true`, the router will use the name of the route as the title of the page.
   *
   * @default false
   */
  nameAsTitle?: boolean;
  /**
   * If `true`, the router will follow redirects when executing guards.
   *
   * @default true
   */
  followGuardRedirects?: boolean;
};

export const RouterPathPriority = <T extends Route<any> = Route>(a: T, b: T): number =>
  (b.path?.length || 0) - (a.path?.length || 0) || (b.path || '').localeCompare(a.path || '');

/**
 * Options to initialize a {@link Router} instance.
 */
export type RouterOptions<Name extends RouteName = RouteName> = {
  /**
   * History instance to use.
   *
   * @see [MDN for more information](https://developer.mozilla.org/docs/Web/API/History)
   * @default globalThis.history
   */
  history?: IHistory<Name>;
  /**
   * Location instance to use.
   *
   * @see [MDN for more information](https://developer.mozilla.org/docs/Web/API/Location)
   * @default globalThis.location
   */
  location?: Location;
  /**
   * Navigation instance to use.
   *
   * @see [MDN for more information](https://developer.mozilla.org/docs/Web/API/Navigation)
   * @default window.navigation
   */
  navigation?: Navigation;
  /**
   * Log level of the router.
   * - `-1` - Silent
   * - `0` - Error
   * - `1` - Warn
   * - `2` - Info
   * - `3` - Debug
   *
   * @default 1 - Warn
   */
  logLevel?: LogLevel | keyof typeof LogLevel;
  /**
   * Initial list of routes that should be added to the router.
   */
  routes?: Readonly<Route<Name>[]>;
  /**
   * If `truthy`, the router will listen to events when instantiated.
   * - 'currententrychange' for external navigation events (navigation API if available).
   * - 'popstate' event for external history navigation (history API).
   *
   * Note: If set to 'navigation' and navigation API is not available, it will fallback to 'history'.
   * This is useful to sync a router instance with another or with native navigation events.
   *
   * Warning: If set to 'navigation' and multiple router instances are listening to the same navigation events, it may cause conflicts (especially for redirects).
   *
   * @see {@link RouterOptions.update}
   * @see [Navigation API](https://developer.mozilla.org/docs/Web/API/Navigation)
   * @see [History API](https://developer.mozilla.org/docs/Web/API/History)
   *
   * @default false
   */
  listen?: boolean | 'navigation' | 'history';
  /**
   * Whether to update (push or replace) the history state when syncing the router with external events.
   *
   * @see {@link RouterOptions.listen}
   *
   * @default replace
   */
  syncUpdate?: false | 'push' | 'replace';

  /**
   * Time in milliseconds to debounce the router sync with the current location.
   * This is useful to avoid multiple syncs when the location changes rapidly.
   *
   * @see {@link RouterOptions.listen}
   *
   * @default 0
   */
  syncDebounce?: number;
  /**
   * A sorting function to sort the routes when resolving.
   * By default, the routes are sorted by length of the path and then by reverse alphabetical order (to keep wildcards at the end).
   *
   * @param a - Route to compare
   * @param b - Route to compare
   *
   * @example (a, b) => b.path.length - a.path.length || b.path.localeCompare(a.path)
   */
  priority?: (a: Route<Name>, b: Route<Name>) => number;
  /**
   * If `true`, the route name will be case-sensitive, otherwise route names will be coerced to lowercase.
   *
   * Note: When using case-sensitive, route names will be coerced to string even if they are numbers or symbols.
   *
   * @default false
   */
  caseSensitive?: boolean;
  /**
   * A route guard that executes before any navigation.
   */
  beforeEach?: NavigationGuard<Name>;
  /**
   * A navigation listener that is executed when the navigation is triggered but before the route is resolved.
   */
  onStart?: NavigationListener<Name>;
  /**
   * A navigation listener that is executed when the navigation is triggered and the route is resolved.
   */
  onEnd?: NavigationEndListener<Name>;
  /**
   * A navigation listener that is executed when an error occurs during navigation.
   */
  onError?: NavigationErrorListener<Name>;
} & RouterNavigationOptions &
  RouteNavigationOptions;

/**
 * Snapshot of the router options.
 */
export type RouterOptionsSnapshot<Name extends RouteName = RouteName> = RouterNavigationOptions &
  RouteNavigationOptions &
  Pick<RouterOptions<Name>, 'listen' | 'caseSensitive' | 'syncUpdate' | 'syncDebounce'>;

/**
 * Default options to initialize a {@link Router} instance.
 */
export const defaultOptions: Omit<RouterOptions<any>, 'history' | 'location'> & Required<Pick<RouterOptions<any>, 'history' | 'location'>> = {
  history: globalThis?.history,
  location: globalThis?.location,
  navigation: typeof window !== 'undefined' ? window.navigation : undefined,
  listen: 'history',
  syncUpdate: 'replace',
  syncDebounce: 0,
  priority: RouterPathPriority,
  caseSensitive: false,
  hash: false,
  strict: false,
  failOnNotFound: false,
  metaAsState: false,
  nameAsTitle: false,
  stripQuery: false,
  stripHash: false,
  stripTrailingHash: false,
  followGuardRedirects: true,
};

export interface IRouter<Name extends RouteName = RouteName> {
  /**
   * Unique identifier of the router instance.
   */
  readonly id: string;

  /**
   * Last navigation error that occurred.
   */
  readonly error?: unknown;

  /**
   * Current {@link INavigationEvent} if a navigation is in progress.
   */
  readonly routing?: INavigationEvent<Name>;

  /**
   * Current {@link ResolvedRoute}
   */
  readonly current?: ResolvedRouterLocation<Name>;

  /**
   * Current {@link RouterLocation}
   */
  readonly location?: RouterLocation<Name>;

  /**
   * Current {@link Route}
   */
  readonly route?: ParsedRoute<Name>;

  /**
   * Get a full list of all the {@link Route}.
   */
  readonly routes: ParsedRoute<Name>[];

  /**
   * Get the options used to initialize the router.
   */
  readonly options: RouterOptionsSnapshot<Name>;

  /**
   * Checks if a route with a given name exists
   *
   * @param name - Name of the route to check
   */
  hasRouteName(name: Name): boolean;

  /**
   * Checks if a route with a given path exists
   *
   * @param path - Path of the route to check
   */
  hasRoutePath(path: Route<Name>['path']): boolean;

  /**
   * Checks if a route with a given name or path exists
   *
   * @param route - Partial route with name or path
   */
  hasRoute(route: Pick<Route<Name>, 'name' | 'path'> | { name: Name; path?: string }): boolean;

  /**
   * Add a new {@link Route} to the router.
   *
   * @param route - Route Record to add
   *
   * @throws {@link RouterNameConflictError} if a route with the same name already exists
   * @throws {@link RouterPathConflictError} if a route with the same path already exists
   */
  addRoute(route: Route<Name>): IRouter<Name>;

  /**
   * Add multiple {@link Route} to the router.
   *
   * @param routes - List of Route Records to add
   *
   * @throws {@link RouterNameConflictError} if a route with the same name already exists
   * @throws {@link RouterPathConflictError} if a route with the same path already exists
   */
  addRoutes(routes: Route<Name>[]): IRouter<Name>;

  /**
   * Remove an existing route by its name.
   *
   * @param route - Partial route with name or path
   */
  removeRoute(route: Pick<Route<Name>, 'name' | 'path'> | { name: Name; path?: string }): boolean;

  /**
   * Remove multiple routes by their name or path.
   * @param routes - Array of routes to remove
   *
   * @returns Array of removed routes
   */
  removeRoutes(routes: Route<Name>[]): Route<Name>[];

  /**
   * Add a navigation guard that executes before any navigation.
   *
   * @return Returns a function that removes the registered guard.
   *
   * @param guard - navigation guard to add
   */
  beforeEach(guard: NavigationGuard<Name>): () => void;

  /**
   * Add a navigation listener that is executed when the navigation is triggered but before the route is resolved.
   *
   * @param listener - navigation listener to add
   *
   * @returns a function that removes the registered listener
   */
  onStart(listener: NavigationListener<Name>): () => void;

  /**
   * Add a navigation listener that is executed when the navigation is triggered and the route is resolved.
   *
   * @param listener - navigation listener to add
   *
   * @returns a function that removes the registered listener
   */
  onEnd(listener: NavigationEndListener<Name>): () => void;

  /**
   * Add a navigation listener that is executed when an error occurs during navigation.
   *
   * @param listener - navigation listener to add
   *
   * @returns a function that removes the registered listener
   */
  onError(listener: NavigationErrorListener<Name>): () => void;

  /**
   * Sync the router with the current location.
   * @private
   */
  sync(): Promise<ResolvedRouterLocationSnapshot<Name>>;

  /**
   * Returns the {@link ResolvedRoute} from a {@link RouteNavigation} and current route {@link Route}.
   *
   * By default, the `currentLocation` used is `router.currentRoute` and should only be overridden in advanced use cases.
   *
   * @param to - Route location to navigate to
   * @param options - Additional options to pass to the resolver
   *
   * @throws {@link NavigationNotFoundError} if the navigation is not found.
   * @throws {@link ParsingError} if the URL cannot be parsed.
   */
  resolve(
    to: RouteNavigation<Name>,
    options?: Omit<RouterNavigationOptions, 'metaAsState' | 'nameAsTitle'> & { from?: Route<Name> },
  ): ResolvedRoute<Name>;

  /**
   * Programmatically navigate to a new URL by pushing an entry in the history stack.
   *
   * @param to - Route location to navigate to
   * @param options - Additional options to pass to the resolver
   *
   * @throws {@link NavigationNotFoundError} if the route is not found.
   * @throws {@link NavigationCancelledError} if the navigation is cancelled before completion.
   * @throws {@link NavigationAbortedError} if the navigation is aborted by a navigation guard.
   * @throws {@link ParsingError} if the URL cannot be parsed.
   */
  push(
    to: RouteNavigation<Name>,
    options?: RouterNavigationOptions,
  ): ResolvedRouterLocationSnapshot<Name> | Promise<ResolvedRouterLocationSnapshot<Name>>;

  /**
   * Programmatically navigate to a new URL by replacing the current entry in the history stack.
   *
   * @param to - Route location to navigate to
   * @param options - Additional options to pass to the resolver
   *
   * @throws {@link NavigationNotFoundError} if the route is not found.
   * @throws {@link NavigationCancelledError} if the navigation is cancelled before completion.
   * @throws {@link NavigationAbortedError} if the navigation is aborted by a navigation guard.
   * @throws {@link ParsingError} if the URL cannot be parsed.
   */
  replace(
    to: RouteNavigation<Name>,
    options?: RouterNavigationOptions,
  ): ResolvedRouterLocationSnapshot<Name> | Promise<ResolvedRouterLocationSnapshot<Name>>;

  /**
   * Go back in history if possible by calling `history.back()`.
   * Equivalent to `router.go(-1)`.
   */
  back(): Promise<ResolvedRouterLocationSnapshot<Name>>;

  /**
   * Go forward in history if possible by calling `history.forward()`.
   * Equivalent to `router.go(1)`.
   */
  forward(): Promise<ResolvedRouterLocationSnapshot<Name>>;

  /**
   * Allows you to move forward or backward through the history.
   * Calls `history.go()`.
   *
   * @param delta - The position in the history to which you want to move, relative to the current page
   */
  go(delta: number): Promise<ResolvedRouterLocationSnapshot<Name>>;

  /**
   * Teardown function to clean up the router instance.
   */
  destroy(): void;
}
