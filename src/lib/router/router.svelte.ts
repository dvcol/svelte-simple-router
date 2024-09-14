/// <reference types="navigation-api-types" />

import type { NavigationGuard, NavigationListener, ResolvedRoute, Route, RouteName, RouteNavigation } from '~/models/route.model.js';

import type { IRouter, ResolvedRouterLocation, RouterLocation, RouterNavigationOptions, RouterOptions } from '~/models/router.model.js';

import { NavigationNotFoundError, RouterNameConflictError, RouterNamePathMismatchError, RouterPathConflictError } from '~/models/error.model.js';
import { Matcher, replacePathParams } from '~/models/matcher.model.js';
import { RouterStateSymbol } from '~/models/router.model.js';

import { Logger } from '~/utils/logger.utils.js';
import { computeAbsolutePath, resolveNewHref, routeToHistoryState } from '~/utils/navigation.utils.js';

type InternalRoute<Name extends RouteName = string> = Route<Name> & { matcher: Matcher<Name> };

export class Router<Name extends RouteName = string> implements IRouter<Name> {
  /**
   * Original options object passed to create the Router
   */
  readonly #options: RouterOptions<Name> & { history: History };

  /**
   * Map of all the routes added to the router.
   * @private
   */
  #routes: Map<string, InternalRoute<Name>> = $state(new Map());

  /**
   * Map of all the named routes added to the router.
   * @private
   */
  #namedRoutes: Map<Name, string> = $state(new Map());

  /**
   * List of all the routes matchers.
   * @private
   */
  #internalRoutes = $derived(Array.from(this.#routes.values()));

  /**
   * Current {@link RouterLocation}
   */
  #location?: RouterLocation<Name> = $state();

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
   * Event listener for the `beforeunload` event.
   * @private
   */
  #beforeUnloadListener: (event?: BeforeUnloadEvent) => void = () => {
    if (this.#history.state?.[RouterStateSymbol]) return;
    const { state, title } = routeToHistoryState({ route: this.route, location: this.location }, this.#options);
    this.#history.replaceState(state, title ?? '');
  };

  /**
   * Event listener for the `popstate` event.
   * @param event
   * @private
   */
  #popStateListener: (event: PopStateEvent) => void = (event: PopStateEvent) => {
    console.info('popstate', { isInternalEvent: event.state?.[RouterStateSymbol], event }, this.routes);
    // Todo listen to popstate
  };

  /**
   * Event listener for the `navigate` event.
   * @param event
   * @private
   */
  #navigateListener: (event: NavigationCurrentEntryChangeEvent) => void = (event: NavigationCurrentEntryChangeEvent) => {
    console.info('navigate', { event }, this.routes);
    // Todo listen to navigate
  };

  /**
   * History instance to use.
   * @private
   */
  get #history(): History {
    return this.#options.history ?? window.history;
  }

  /**
   * Current {@link RouterLocation}
   */
  get location(): RouterLocation<Name> | undefined {
    return this.#location;
  }

  /**
   * Current {@link Route}
   */
  get route(): Route<Name> | undefined {
    return this.#route;
  }
  /**
   * Get a full list of all the {@link Route}.
   */
  get routes(): Route<Name>[] {
    return Array.from(this.#routes.values());
  }

  constructor(options: RouterOptions<Name>) {
    this.#options = { history: window.history, listen: true, ...options };
    this.#options.routes?.forEach(this.addRoute);
    if (this.#options.listen) this.init();
    Logger.debug('Router created', { options: this.#options });
  }

  init() {
    if (this.#listening) return;
    window.addEventListener('popstate', this.#popStateListener);
    window.addEventListener('beforeunload', this.#beforeUnloadListener);
    window.navigation?.addEventListener('currententrychange', this.#navigateListener);
    this.#listening = true;
    Logger.debug('Router init', { listening: this.#listening });
  }

  destroy() {
    window.removeEventListener('popstate', this.#popStateListener);
    window.removeEventListener('beforeunload', this.#beforeUnloadListener);
    window.navigation?.removeEventListener('currententrychange', this.#navigateListener);
    this.#listening = false;
    Logger.debug('Router destroy', { listening: this.#listening });
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
    const _route = route as InternalRoute<Name>;
    _route.matcher = new Matcher(route);
    this.#routes.set(route.path, _route);
    if (route.name) this.#namedRoutes.set(route.name, route.path);
    Logger.debug('Route added', { route, routes: this.routes, names: this.#namedRoutes });
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
    Logger.debug('Removing route', { name: _name, path: _path, routes: this.routes, names: this.#namedRoutes });
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
    {
      from = this.#route,
      strict,
      failOnNotFound,
      base,
      hash,
    }: Omit<RouterNavigationOptions, 'metaAsState' | 'nameAsTitle'> & { from?: Route<Name> } = this.#options,
  ): ResolvedRoute<Name> {
    const { query, params, path, name } = to;

    let _path: string | undefined = path;
    // if 'name' is present, use namedRoutes to resolve path
    if (!path && name) _path = this.#namedRoutes.get(name);
    if (!_path) throw new NavigationNotFoundError({ to, from }, { message: 'No path could be resolved from the provided location' });

    // if relative path, use from and compute absolute path
    if (_path?.startsWith('.')) {
      if (!from) throw new NavigationNotFoundError({ to, from }, { message: 'Relative path provided but no current location could be found' });
      _path = computeAbsolutePath(from?.path ?? '', _path);
    }

    // inject params into path
    if (params && _path) _path = replacePathParams(_path, params);

    // Find exact match
    let route: Route<Name> | undefined = this.#internalRoutes.find(r => r.matcher.match(_path, { strict: true, base }));

    // If no route found, find first match (if strict is false)
    if (!route && !strict) route = this.#internalRoutes.find(r => r.matcher.match(_path, { base }));

    // if no route found and failOnNotFound is true, throw NavigationNotFoundError
    if (!route && failOnNotFound) throw new NavigationNotFoundError({ to, from });

    // use hash, path, and query to resolve new href
    const { href, search } = resolveNewHref(_path, { hash, query });

    // return resolved route
    return {
      route,
      path: _path,
      name: route?.name,
      href,
      query: Object.fromEntries(search),
      params: params ?? {},
    } satisfies ResolvedRoute<Name>;
  }

  /**
   * Navigate to a new URL by updating the current location and route.
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
  #navigate(to: ResolvedRoute<Name>, options: RouterNavigationOptions = this.#options): ResolvedRouterLocation<Name> {
    this.#route = to.route;
    this.#location = {
      origin: to.href.origin,
      base: options.base,
      ...to,
    };
    return { route: this.#route, location: this.#location };
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
  push(
    to: RouteNavigation<Name>,
    { strict, failOnNotFound, metaAsState, nameAsTitle }: RouterNavigationOptions = this.#options,
  ): ResolvedRouterLocation<Name> {
    const resolved = this.resolve(to, { strict, failOnNotFound });
    if (resolved?.route) {
      const { state, title } = routeToHistoryState(resolved, { metaAsState, nameAsTitle, state: to.state });
      this.#history.pushState(state, title ?? '', resolved.href);
      Logger.debug('Route pushed', { resolved, state, title });
    }
    return this.#navigate(resolved);
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
  replace(
    to: RouteNavigation<Name>,
    { strict, failOnNotFound, metaAsState, nameAsTitle }: RouterNavigationOptions = this.#options,
  ): ResolvedRouterLocation<Name> {
    const resolved = this.resolve(to, { strict, failOnNotFound });
    if (resolved?.route) {
      const { state, title } = routeToHistoryState(resolved, { metaAsState, nameAsTitle, state: to.state });
      this.#history.replaceState(state, title ?? '', resolved.href);
      Logger.debug('Route replaced', { resolved, state, title });
    }
    return this.#navigate(resolved);
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
