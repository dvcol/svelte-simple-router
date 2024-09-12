import type {
  NavigationGuard,
  NavigationListener,
  ResolvedRoute,
  Route,
  RouteLocationNavigation,
  RouteName,
  RouteNavigateOptions,
  RouteNavigation,
} from '~/models/route.model.js';

import { NavigationNotFoundError, RouterNameConflictError, RouterNamePathMismatchError, RouterPathConflictError } from '~/models/error.model.js';
import { routeToHistoryState } from '~/utils/navigation.utils.js';

/**
 * Options used to navigate to a route.
 */
export type RouterNavigationOptions = {
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
export type RouterOptions<Name extends RouteName = string> = {
  /**
   * History instance to use.
   * Defaults to global `window.history`.
   * @see [MDN for more information](https://developer.mozilla.org/docs/Web/API/History)
   */
  history?: History;
  /**
   * Initial list of routes that should be added to the router.
   */
  routes: Readonly<Route<Name>[]>;
  /**
   * Base URL from which the app is served.
   * Used to resolve route in a subdomain context.
   */
  base?: string;
  /**
   * If `true`, the router will listen to the `popstate` and 'beforeunload' events when instantiated.
   */
  listen?: boolean;
  /**
   * If `true`, the router will restore the scroll position when navigating back.
   */
  restoreScroll?: boolean;
} & RouterNavigationOptions;

export class Router<Name extends RouteName = string> {
  /**
   * Original options object passed to create the Router
   */
  readonly #options: RouterOptions<Name> & { history: History };

  /**
   * Map of all the routes added to the router.
   * @private
   */
  #routes: Map<string, Route<Name>> = $state(new Map());

  /**
   * Map of all the named routes added to the router.
   * @private
   */
  #namedRoutes: Map<Name, string> = $state(new Map());

  /**
   * Current {@link RouteLocationNavigation}
   */
  #location?: RouteLocationNavigation = $state();

  /**
   * Current {@link Route}
   */
  #route?: Route<Name> = $state();

  /**
   * Promise that resolves when the router is done loading the current route.
   * @private
   */
  #loading?: Promise<ResolvedRoute<Name>> = $state();

  /**
   * List of navigation guards that should be executed before each navigation.
   * @private
   */
  #beforeEachGuards: Set<NavigationGuard<Name>> = $state(new Set());

  /**
   * List of navigation guards that should be executed after each navigation.
   * @private
   */
  #afterEachGuards: Set<NavigationGuard<Name>> = $state(new Set());

  /**
   * List of navigation listeners that should be executed when the navigation is triggered but before the route is resolved.
   * @private
   */
  #onLoadingListeners: Set<NavigationListener<Name>> = $state(new Set());

  /**
   * List of navigation listeners that should be executed when the navigation is triggered and the route is resolved.
   * @private
   */
  #onLoadedListeners: Set<NavigationListener<Name>> = $state(new Set());

  /**
   * List of navigation listeners that should be executed when an error occurs during navigation.
   * @private
   */
  #onErrorListeners: Set<NavigationListener<Name>> = $state(new Set());

  /**
   * If the router is listening to the `popstate` and 'beforeunload' events.
   * @private
   */
  #listening = false;

  /**
   * Event listener for the `popstate` event.
   * @param event
   * @private
   */
  #historyListener: (event: PopStateEvent) => void = (event: PopStateEvent) => {
    // Todo update location and route
    console.info('popstate', event, this.location, this.route);
  };

  /**
   * Event listener for the `beforeunload` event.
   * @param event
   * @private
   */
  #beforeUnloadListener: (event: BeforeUnloadEvent) => void = (event: BeforeUnloadEvent) => {
    // Todo save scroll position in state
    console.info('beforeunload', event, this.location, this.route);
  };

  /**
   * History instance to use.
   * @private
   */
  get #history(): History {
    return this.#options.history ?? window.history;
  }

  /**
   * Current {@link Route}
   */
  get route(): Route<Name> | undefined {
    return this.#route;
  }

  /**
   * Current {@link RouteLocationNavigation}
   */
  get location(): RouteLocationNavigation | undefined {
    return this.#location;
  }

  /**
   * Get a full list of all the {@link Route}.
   */
  get routes(): Route<Name>[] {
    return Array.from(this.#routes.values());
  }

  constructor(options: RouterOptions<Name>) {
    this.#options = { history: window.history, ...options };
    this.#options.routes?.forEach(this.addRoute);
    if (this.#options.listen) this.init();
  }

  init() {
    if (this.#listening) return;
    window.addEventListener('popstate', this.#historyListener);
    window.addEventListener('beforeunload', this.#beforeUnloadListener);
    this.#listening = true;
  }

  destroy() {
    window.removeEventListener('popstate', this.#historyListener);
    window.removeEventListener('beforeunload', this.#beforeUnloadListener);
    this.#listening = false;
  }

  /**
   * Checks if a route with a given name exists
   *
   * @param name - Name of the route to check
   */
  hasRouteName(name: Name): boolean {
    return this.#namedRoutes.has(name);
  }

  /**
   * Checks if a route with a given path exists
   *
   * @param path - Path of the route to check
   */
  hasRoutePath(path: Route<Name>['path']): boolean {
    return this.#routes.has(path);
  }

  /**
   * Checks if a route with a given name exists
   *
   * @param nameOrPath - Name or path of the route to check
   */
  hasRoute(nameOrPath: Name | Route<Name>['path']): boolean {
    return this.hasRouteName(nameOrPath as Name) || this.hasRoutePath(nameOrPath as Route<Name>['path']);
  }

  /**
   * Add a new {@link Route} to the router.
   *
   * @param route - Route Record to add
   *
   * @throws {@link RouterNameConflictError} if a route with the same name already exists
   * @throws {@link RouterPathConflictError} if a route with the same path already exists
   */
  addRoute(route: Route<Name>): Router<Name> {
    if (route.name && this.hasRouteName(route.name)) throw new RouterNameConflictError(route.name);
    if (route.path && this.hasRoutePath(route.path)) throw new RouterPathConflictError(route.path);
    this.#routes.set(route.path, route);
    if (route.name) this.#namedRoutes.set(route.name, route.path);
    return this;
  }

  /**
   * Remove an existing route by its name.
   *
   * @param name - Name of the route to remove
   * @param path - Path of the route to remove
   */
  removeRoute({ path, name }: { name: Name; path?: Route<Name>['path'] } | { name?: Name; path: Route<Name>['path'] }): boolean {
    // If no name or path is provided, return false
    if (!name && !path) return false;

    // Check if the name or path provided matches the registered name or path when both are provided
    const registeredPath = name ? this.#namedRoutes.get(name) : undefined;
    const registeredName = path ? this.#routes.get(path)?.name : undefined;
    if (name && path) {
      if (registeredPath && registeredPath !== path) throw new RouterNamePathMismatchError<Name>({ name, path, registeredPath });
      if (registeredName && registeredName !== name) throw new RouterNamePathMismatchError<Name>({ name, path, registeredName });
    }

    const _path = path || registeredPath;
    const _name = name || registeredName;
    if (_name && !_path) return this.#namedRoutes.delete(_name);
    if (_path && !_name) return this.#routes.delete(_path);
    if (_name && _path) return this.#routes.delete(_path) || this.#namedRoutes.delete(_name);
    return false;
  }

  /**
   * Add a navigation guard that executes before any navigation.
   *
   * @return Returns a function that removes the registered guard.
   *
   * @param guard - navigation guard to add
   */
  beforeEach(guard: NavigationGuard<Name>): () => void {
    this.#beforeEachGuards.add(guard);
    return () => this.#beforeEachGuards.delete(guard);
  }

  /**
   * Add a navigation hook that is executed after every navigation.
   *
   * @param guard - navigation hook to add
   *
   * @returns a function that removes the registered hook
   */
  afterEach(guard: NavigationGuard<Name>): () => void {
    this.#afterEachGuards.add(guard);
    return () => this.#afterEachGuards.delete(guard);
  }

  /**
   * Add a navigation listener that is executed when the navigation is triggered but before the route is resolved.
   *
   * @param listener - navigation listener to add
   *
   * @returns a function that removes the registered listener
   */
  onLoading(listener: NavigationListener<Name>): () => void {
    this.#onLoadingListeners.add(listener);
    return () => this.#onLoadingListeners.delete(listener);
  }

  /**
   * Add a navigation listener that is executed when the navigation is triggered and the route is resolved.
   *
   * @param listener - navigation listener to add
   *
   * @returns a function that removes the registered listener
   */
  onLoaded(listener: NavigationListener<Name>): () => void {
    this.#onLoadedListeners.add(listener);
    return () => this.#onLoadedListeners.delete(listener);
  }

  /**
   * Add a navigation listener that is executed when an error occurs during navigation.
   *
   * @param listener - navigation listener to add
   *
   * @returns a function that removes the registered listener
   */
  onError(listener: NavigationListener<Name>): () => void {
    this.#onErrorListeners.add(listener);
    return () => this.#onErrorListeners.delete(listener);
  }

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
    { from = this.#route, strict, failOnNotFound }: Omit<RouterNavigationOptions, 'metaAsState' | 'nameAsTitle'> & { from?: Route<Name> } = this
      .#options,
  ): ResolvedRoute<Name> {
    // TODO: Implement
    if (strict) console.info('Todo: Implement strict matching');
    if (failOnNotFound) throw new NavigationNotFoundError({ to, from });
    return {} as ResolvedRoute<Name>;
  }

  /**
   * Programmatically navigate to a new URL by pushing or replacing an entry in the history stack.
   *
   * @param to - Route location to navigate to
   * @param options - Additional options to pass to the resolver
   * @param options.strict - If `true`, will only match exact routes
   * @param options.failOnNotFound - If `true`, will throw an error if the route is not found
   * @param options.metaAsState - If `true`, will push the `meta` property of the route to the state
   * @param options.nameAsTitle - If `true`, will use the name of the route as the title of the page
   *
   * @throws {@link NavigationFailure} if the navigation is aborted, cancelled, or not found.
   */
  navigate(to: RouteNavigation<Name> & RouteNavigateOptions, options: RouterNavigationOptions = this.#options): Promise<ResolvedRoute<Name>> {
    if (to.replace) return this.replace(to, options);
    return this.push(to, options);
  }

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
  async push(
    to: RouteNavigation<Name>,
    { strict, failOnNotFound, metaAsState, nameAsTitle }: RouterNavigationOptions = this.#options,
  ): Promise<ResolvedRoute<Name>> {
    const resolved = this.resolve(to, { strict, failOnNotFound });
    if (resolved?.route) {
      const { state, title } = routeToHistoryState(resolved.route, { metaAsState, nameAsTitle });
      this.#history.pushState(state, title ?? '', resolved.href);
    }
    return resolved;
  }

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
  async replace(
    to: RouteNavigation<Name>,
    { strict, failOnNotFound, metaAsState, nameAsTitle }: RouterNavigationOptions = this.#options,
  ): Promise<ResolvedRoute<Name>> {
    const resolved = this.resolve(to, { strict, failOnNotFound });
    if (resolved?.route) {
      const { state, title } = routeToHistoryState(resolved.route, { metaAsState, nameAsTitle });
      this.#history.replaceState(state, title ?? '', resolved.href);
    }
    return resolved;
  }

  /**
   * Go back in history if possible by calling `history.back()`.
   * Equivalent to `router.go(-1)`.
   */
  back(): ReturnType<Router['go']> {
    this.#history.back();
  }

  /**
   * Go forward in history if possible by calling `history.forward()`.
   * Equivalent to `router.go(1)`.
   */
  forward(): ReturnType<Router['go']> {
    this.#history.forward();
  }

  /**
   * Allows you to move forward or backward through the history.
   * Calls `history.go()`.
   *
   * @param delta - The position in the history to which you want to move, relative to the current page
   */
  go(delta: number): void {
    this.#history.go(delta);
  }
}

export const RouterContext = Symbol('SvelteSimpleRouterContext');
