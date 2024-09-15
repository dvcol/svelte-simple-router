import type { Snippet } from 'svelte';
import type {
  HistoryState,
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

export type ResolvedRouterLocation<Name extends RouteName = RouteName> = {
  route?: Route<Name>;
  location?: RouterLocation<Name>;
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
   */
  hash?: boolean;
  /**
   * If `true`, the router will match the routes strictly.
   */
  strict?: boolean;
  /**
   * If `true`, the router will throw an error if the route is not found during navigation, resolve, push or replace state.
   */
  failOnNotFound?: boolean;
  /**
   * If `true`, the router will push the `meta` property of the route to the state.
   *
   * Warning: Depending on the history implementation, the state may not hold any reactive values and some primitives like Symbols are forbidden.
   *
   * @see [MDN for more information](https://developer.mozilla.org/en-US/docs/Web/API/History/state)
   */
  metaAsState?: boolean;
  /**
   * If `true`, the router will use the name of the route as the title of the page.
   */
  nameAsTitle?: boolean;
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
} & RouterNavigationOptions;

export interface IRouter<Name extends RouteName = RouteName> {
  /**
   * Unique identifier of the router instance.
   */
  id: string;
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
   * Add a navigation hook that is executed after every navigation.
   *
   * @param guard - navigation hook to add
   *
   * @returns a function that removes the registered hook
   */
  afterEach(guard: NavigationGuard<Name>): () => void;

  /**
   * Add a navigation listener that is executed when the navigation is triggered but before the route is resolved.
   *
   * @param listener - navigation listener to add
   *
   * @returns a function that removes the registered listener
   */
  onLoading(listener: NavigationListener<Name>): () => void;

  /**
   * Add a navigation listener that is executed when the navigation is triggered and the route is resolved.
   *
   * @param listener - navigation listener to add
   *
   * @returns a function that removes the registered listener
   */
  onLoaded(listener: NavigationListener<Name>): () => void;

  /**
   * Add a navigation listener that is executed when an error occurs during navigation.
   *
   * @param listener - navigation listener to add
   *
   * @returns a function that removes the registered listener
   */
  onError(listener: NavigationListener<Name>): () => void;

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
    { from, strict, failOnNotFound }?: Omit<RouterNavigationOptions, 'metaAsState' | 'nameAsTitle'> & { from?: Route<Name> },
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
  push(
    to: RouteNavigation<Name>,
    { strict, failOnNotFound, metaAsState, nameAsTitle }?: RouterNavigationOptions,
  ): ResolvedRouterLocation<Name> | Promise<ResolvedRouterLocation<Name>>;

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
  replace(
    to: RouteNavigation<Name>,
    { strict, failOnNotFound, metaAsState, nameAsTitle }?: RouterNavigationOptions,
  ): ResolvedRouterLocation<Name> | Promise<ResolvedRouterLocation<Name>>;

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
