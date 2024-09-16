import type { Snippet } from 'svelte';
import type {
  BaseRoute,
  HistoryState,
  NavigationEndListener,
  NavigationErrorListener,
  NavigationGuard,
  NavigationListener,
  ResolvedRoute,
  Route,
  RouteName,
  RouteNavigation,
  RouteParams,
  RouteQuery,
  RouteWildcards,
} from '~/models/route.model.js';

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

export type BasicRouterLocation<Name extends RouteName = RouteName> = Omit<RouterLocation<Name>, 'href'> & { href: string };
export const toBasicRouterLocation = <Name extends RouteName = RouteName>(loc?: RouterLocation<Name>): BasicRouterLocation<Name> | undefined => {
  if (!loc) return loc;
  return {
    ...loc,
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

export const RouterContextSymbol = Symbol('SvelteSimpleRouterContext');

export const RouterStateConstant = '__SVELTE_SIMPLE_ROUTER_STATE__' as const;
export const RouterScrollConstant = '__SVELTE_SIMPLE_ROUTER_SCROLL__' as const;
export const RouterDebuggerConstant = '__SVELTE_SIMPLE_ROUTER_DEBUGGER__' as const;

export type RouterContextProps<Name extends RouteName = any> = { router?: IRouter<Name>; options?: RouterOptions<Name> } & {
  children?: Snippet<[IRouter<Name>]>;
};
export type RouterViewProps = RouterContextProps & {
  name?: string;
  loading?: Snippet<[unknown]>;
  error?: Snippet<[unknown]>;
};

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
   * Defaults to `false`.
   */
  hash?: boolean;
  /**
   * If `true`, the router will match the routes strictly.
   * Defaults to `false`.
   */
  strict?: boolean;
  /**
   * If `true`, the router will throw an error if the route is not found during navigation, resolve, push or replace state.
   * Defaults to `false`.
   */
  failOnNotFound?: boolean;
  /**
   * If `true`, the router will push the `meta` property of the route to the state.
   * Defaults to `false`.
   *
   * Warning: Depending on the history implementation, the state may not hold any reactive values and some primitives like Symbols are forbidden.
   *
   * @see [MDN for more information](https://developer.mozilla.org/en-US/docs/Web/API/History/state)
   */
  metaAsState?: boolean;
  /**
   * If `true`, the router will use the name of the route as the title of the page.
   * Defaults to `false`.
   */
  nameAsTitle?: boolean;
  /**
   * If `true`, the router will follow redirects when executing guards.
   * Defaults to `true`.
   */
  followGuardRedirects?: boolean;
};

/**
 * Options to initialize a {@link Router} instance.
 */
export type RouterOptions<Name extends RouteName = RouteName> = {
  /**
   * History instance to use.
   * Defaults to global `window.history`.
   * @see [MDN for more information](https://developer.mozilla.org/docs/Web/API/History)
   */
  history?: IHistory<Name>;
  /**
   * Initial list of routes that should be added to the router.
   */
  routes?: Readonly<Route<Name>[]>;
  /**
   * If `true`, the router will listen to events when instantiated.
   * - 'currententrychange' for external navigation events (if available).
   * - 'popstate' event for external history navigation.
   * @see [Navigation API](https://developer.mozilla.org/docs/Web/API/Navigation)
   * @see [History API](https://developer.mozilla.org/docs/Web/API/History)
   */
  listen?: boolean;
  /**
   * If `true`, the router will restore the scroll position when navigating back.
   */
  restoreScroll?: boolean;
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
} & RouterNavigationOptions;

export interface IRouter<Name extends RouteName = RouteName> {
  /**
   * Unique identifier of the router instance.
   */
  id: string;

  /**
   * Last navigation error that occurred.
   */
  error?: unknown;

  /**
   * Current {@link ResolvedRoute}
   */
  current?: ResolvedRouterLocation<Name>;

  /**
   * Current {@link RouterLocation}
   */
  location?: RouterLocation<Name>;

  /**
   * Current {@link Route}
   */
  route?: Route<Name>;

  /**
   * Get a full list of all the {@link Route}.
   */
  routes: Route<Name>[];

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
   * Checks if a route with a given name exists
   *
   * @param nameOrPath - Name or path of the route to check
   */
  hasRoute(nameOrPath: Name | Route<Name>['path']): boolean;

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
   * Remove an existing route by its name.
   *
   * @param name - Name of the route to remove
   * @param path - Path of the route to remove
   */
  removeRoute({ path, name }: { name: Name; path?: Route<Name>['path'] } | { name?: Name; path: Route<Name>['path'] }): boolean;

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
   * Returns the {@link ResolvedRoute} from a {@link RouteNavigation} and current route {@link Route}.
   *
   * By default, the `currentLocation` used is `router.currentRoute` and should only be overridden in advanced use cases.
   *
   * @param to - Route name or location to resolve
   * @param options - Additional options to pass to the resolver
   * @param options.from - Optional current location to resolve against
   * @param options.strict - If `true`, will only match exact routes
   * @param options.failOnNotFound - If `true`, will throw an error if the route is not found
   *
   * @throws {@link NavigationNotFoundError} if the navigation is not found.
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
   * @param options.strict - If `true`, will only match exact routes
   * @param options.failOnNotFound - If `true`, will throw an error if the route is not found
   * @param options.metaAsState - If `true`, will push the `meta` property of the route to the state
   * @param options.nameAsTitle - If `true`, will use the name of the route as the title of the page
   *
   * @throws {@link NavigationFailure} if the navigation is not found.
   */
  push(to: RouteNavigation<Name>, options?: RouterNavigationOptions): ResolvedRouterLocation<Name> | Promise<ResolvedRouterLocation<Name>>;

  /**
   * Programmatically navigate to a new URL by replacing the current entry in the history stack.
   *
   * @param to - Route location to navigate to
   * @param options - Additional options to pass to the resolver
   * @param options.strict - If `true`, will only match exact routes
   * @param options.failOnNotFound - If `true`, will throw an error if the route is not found
   *
   * @throws {@link NavigationNotFoundError} if the navigation is not found.
   */
  replace(to: RouteNavigation<Name>, option?: RouterNavigationOptions): ResolvedRouterLocation<Name> | Promise<ResolvedRouterLocation<Name>>;

  /**
   * Go back in history if possible by calling `history.back()`.
   * Equivalent to `router.go(-1)`.
   */
  back(): ReturnType<IRouter['go']>;

  /**
   * Go forward in history if possible by calling `history.forward()`.
   * Equivalent to `router.go(1)`.
   */
  forward(): ReturnType<IRouter['go']>;

  /**
   * Allows you to move forward or backward through the history.
   * Calls `history.go()`.
   *
   * @param delta - The position in the history to which you want to move, relative to the current page
   */
  go(delta: number): void;
}
