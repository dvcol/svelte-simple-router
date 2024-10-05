/// <reference types="navigation-api-types" />

import { randomHex } from '@dvcol/common-utils';

import { raceUntil } from '@dvcol/common-utils/common/promise';

import { computeAbsolutePath, toPathSegment } from '@dvcol/common-utils/common/string';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';

import type { NavigationGuard, ParsedRoute, ResolvedRoute, Route, RouteName, RouteNavigation } from '~/models/route.model.js';

import type {
  IHistory,
  INavigationEvent,
  IRouter,
  NavigationEndListener,
  NavigationErrorListener,
  NavigationListener,
  ResolvedRouterLocation,
  ResolvedRouterLocationSnapshot,
  RouterLocation,
  RouterNavigationOptions,
  RouterOptions,
  RouterOptionsSnapshot,
  RouterStateLocation,
} from '~/models/router.model.js';

import {
  NavigationCancelledError,
  NavigationNotFoundError,
  RouterNameConflictError,
  RouterNamePathMismatchError,
  RouterPathConflictError,
} from '~/models/error.model.js';
import { Matcher, replaceTemplateParams } from '~/models/matcher.model.js';
import { cloneRoute, toBaseRoute } from '~/models/route.model.js';
import {
  defaultOptions,
  isResolvedLocationEqual,
  NavigationEvent,
  RouterPathPriority,
  RouterStateConstant,
  toBasicRouterLocation,
} from '~/models/router.model.js';

import { Logger, LoggerKey } from '~/utils/logger.utils.js';
import { preventNavigation, resolveNewHref, routeToHistoryState } from '~/utils/navigation.utils.js';

export class Router<Name extends RouteName = RouteName> implements IRouter<Name> {
  /**
   * Unique identifier for the router instance.
   * @private
   */
  readonly id = `r${randomHex(4)}`;

  /**
   * Logger prefix for the router instance.
   * @private
   */
  readonly #log = `[${LoggerKey} - ${this.id}]`;

  /**
   * Original options object passed to create the Router
   * @private
   */
  readonly #options: RouterOptions<Name> & { history: IHistory<Name>; location: Location };

  /**
   * Map of all the routes added to the router.
   * @reactive
   * @private
   */
  #routes: Map<string, ParsedRoute<Name>> = $state(new SvelteMap());

  /**
   * Sorted list of all the routes added to the router.
   * @reactive
   * @private
   */
  #sortedRoutes = $derived<ParsedRoute<Name>[]>(Array.from(this.#routes.values()).sort(this.#priority));

  /**
   * Map of all the named routes added to the router.
   * @reactive
   * @private
   */
  #namedRoutes: Map<Name, string> = $state(new SvelteMap());

  /**
   * Current {@link RouterLocation}
   * @reactive
   * @private
   */
  #location?: RouterLocation<Name> = $state();

  /**
   * Current {@link Route}
   * @reactive
   * @private
   */
  #route?: ParsedRoute<Name> = $state();

  /**
   * Last error that occurred during navigation.
   * @reactive
   * @private
   */
  #error?: unknown = $state();

  /**
   * Promise that resolves when the router is done loading the current route.
   * @reactive
   * @private
   */
  #routing?: NavigationEvent<Name> = $state();

  /**
   * List of navigation guards that should be executed before each navigation.
   * @reactive
   * @private
   */
  #beforeEachGuards: Set<NavigationGuard<Name>> = $state(new SvelteSet());

  /**
   * List of navigation listeners that should be executed when the navigation is triggered but before the route is resolved.
   * @reactive
   * @private
   */
  #onStartListeners: Set<NavigationListener<Name>> = $state(new SvelteSet());

  /**
   * List of navigation listeners that should be executed when the navigation is triggered and the route is resolved.
   * @reactive
   * @private
   */
  #onEndListeners: Set<NavigationEndListener<Name>> = $state(new SvelteSet());

  /**
   * List of navigation listeners that should be executed when an error occurs during navigation.
   * @reactive
   * @private
   */
  #onErrorListeners: Set<NavigationErrorListener<Name>> = $state(new SvelteSet());

  /**
   * If the router is listening to `popstate` (history API)  or `currententrychange` (navigation API)  events.
   * @reactive
   * @private
   */
  #listening: 'navigation' | 'history' | false = $state(false);

  /**
   * Event listener for the `navigate` or `popstate` event.
   * @private
   */
  #navigateListener: (event: PopStateEvent | NavigationCurrentEntryChangeEvent) => void = async () => {
    const routerState: RouterStateLocation<Name> = this.#history.state?.[RouterStateConstant];
    if (routerState && this.#location?.href?.toString() === routerState.href?.toString()) return;
    await this.sync();
    Logger.debug(this.#log, 'Navigate listener', this.snapshot, routerState);
  };

  /**
   * History instance to use.
   * @private
   */
  get #history(): IHistory<Name> {
    return this.#options.history;
  }

  /**
   * Navigation instance to use.
   * @private
   */
  get #navigation(): Navigation | undefined {
    return this.#options.navigation;
  }

  /**
   * Browser location instance to use.
   * @private
   */
  get #browser(): Location {
    return this.#options.location;
  }

  /**
   * If the router should use the hash portion of the URL for routing.
   * @private
   */
  get #hash(): boolean | undefined {
    return this.#options.hash;
  }

  /**
   * Base path for the router.
   * @private
   */
  get #base(): string | undefined {
    return this.#options.base;
  }

  /**
   * Priority function to sort routes.
   * @private
   */
  get #priority(): (a: ParsedRoute<Name>, b: ParsedRoute<Name>) => number {
    return this.#options.priority ?? RouterPathPriority;
  }

  /**
   * If the router should use the navigation API for listening to navigation events.
   * @private
   */
  get #useNavigationApi(): boolean {
    if (!this.#navigation) return false;
    return this.#options.listen === true || this.#options.listen === 'navigation';
  }

  /**
   * Get the route name map based on the case sensitivity option.
   * @private
   */
  get #routeNameMap(): Pick<Map<Name, string>, 'set' | 'get' | 'delete' | 'has'> {
    if (this.#options.caseSensitive) return this.#namedRoutes;
    return {
      has: (name: Name) => this.#namedRoutes.has(String(name).toLowerCase() as Name),
      get: (name: Name) => this.#namedRoutes.get(String(name).toLowerCase() as Name),
      set: (name: Name, path: string) => this.#namedRoutes.set(String(name).toLowerCase() as Name, path),
      delete: (name: Name) => this.#namedRoutes.delete(String(name).toLowerCase() as Name),
    };
  }

  /**
   * The last error that occurred during navigation.
   * This is reactive and will update when an error occurs.
   * @reactive
   */
  get error(): unknown {
    return this.#error;
  }

  /**
   * The current routing event.
   * This is reactive and will update when a navigation event is triggered.
   * @reactive
   */
  get routing(): INavigationEvent<Name> | undefined {
    return this.#routing;
  }

  /**
   * This is a reactive state of the router.
   * To get a snapshot of the router state, use {@link snapshot} instead.
   * Current {@link ResolvedRouterLocation}
   * @reactive
   */
  get current(): ResolvedRouterLocation<Name> {
    return { route: this.route, location: this.location };
  }

  /**
   * This is a snapshot of the router state.
   * To get a reactive state, use {@link current} instead.
   * Current {@link ResolvedRouterLocation}
   */
  get snapshot(): ResolvedRouterLocationSnapshot<Name> {
    return {
      route: toBaseRoute(this.#route),
      location: toBasicRouterLocation(this.#location),
    };
  }

  /**
   * Router options snapshot.
   * This snapshot is not reactive but it's properties might be (e.g. `listen`).
   */
  get options(): RouterOptionsSnapshot<Name> {
    return {
      base: this.#base,
      hash: this.#hash,
      strict: this.#options.strict,
      failOnNotFound: this.#options.failOnNotFound,
      metaAsState: this.#options.metaAsState,
      nameAsTitle: this.#options.nameAsTitle,
      followGuardRedirects: this.#options.followGuardRedirects,
      caseSensitive: this.#options.caseSensitive,
      listen: this.#listening,
    };
  }

  /**
   * Current {@link RouterLocation}
   * This is reactive and will update when the location changes.
   * @reactive
   */
  get location(): RouterLocation<Name> | undefined {
    return this.#location;
  }

  /**
   * Current {@link Route}.
   * This is reactive and will update when the route changes.
   * @reactive
   */
  get route(): ParsedRoute<Name> | undefined {
    return this.#route;
  }

  /**
   * Get a full list of all the {@link Route}.
   * @reactive
   */
  get routes(): ParsedRoute<Name>[] {
    return this.#sortedRoutes;
  }

  constructor(options: RouterOptions<Name> = {}) {
    this.#options = {
      ...defaultOptions,
      ...options,
      base: toPathSegment(options.base),
    };
    if (this.#options.routes) this.addRoutes(this.#options.routes);
    this.#init();
    if (this.#options?.logLevel !== undefined) Logger.setLogLevel(this.#options.logLevel);
    Logger.debug(this.#log, 'Router created', { options: this.#options });
  }

  async #init() {
    await this.sync();

    if (this.#options.beforeEach) this.#beforeEachGuards.add(this.#options.beforeEach);
    if (this.#options.onStart) this.#onStartListeners.add(this.#options.onStart);
    if (this.#options.onEnd) this.#onEndListeners.add(this.#options.onEnd);
    if (this.#options.onError) this.#onErrorListeners.add(this.#options.onError);
    if (this.#options.listen) this.listen();

    Logger.info(this.#log, 'Router initialized', { options: this.options });
  }

  listen() {
    //  If already listening, exit
    if (this.#listening) return;
    if (typeof window === 'undefined') return;
    if (this.#useNavigationApi) this.#navigation?.addEventListener('currententrychange', this.#navigateListener);
    else window.addEventListener('popstate', this.#navigateListener);
    this.#listening = this.#useNavigationApi ? 'navigation' : 'history';
    Logger.debug(this.#log, 'Router listening', { listening: this.#listening });
  }

  destroy() {
    if (typeof window === 'undefined') return;
    window.removeEventListener('popstate', this.#navigateListener);
    this.#navigation?.removeEventListener('currententrychange', this.#navigateListener);
    this.#listening = false;
    Logger.info(this.#log, 'Router destroyed', { listening: this.#listening });
  }

  /**
   * Checks if a route with a given name exists
   *
   * @param name - Name of the route to check
   */
  hasRouteName(name: Name): boolean {
    return this.#routeNameMap.has(name);
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
   * Checks if a route with a given name or path exists
   *
   * @param route - Partial route with name or path
   */
  hasRoute({ path, name }: Pick<Route<Name>, 'name' | 'path'>): boolean {
    if (name && this.hasRouteName(name)) return true;
    return !!(path && this.hasRoutePath(path));
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
    const _route = cloneRoute(route) as ParsedRoute<Name>;
    if (!_route.matcher) _route.matcher = new Matcher(route);
    this.#routes.set(route.path, _route);
    if (route.name) this.#routeNameMap.set(route.name, route.path);
    route.children?.forEach(child => {
      const _child: Route<Name> = {
        ...child,
        path: [route.path, child.path].map(p => toPathSegment(p)).join(''),
        parent: route,
      };
      this.addRoute(_child);
    });
    Logger.debug(this.#log, 'Route added', { route, routes: this.routes, names: this.#namedRoutes });
    return this;
  }

  /**
   * Add multiple {@link Route} to the router.
   *
   * @param routes - Array of routes to add
   *
   * @throws {@link RouterNameConflictError} if a route with the same name already exists
   * @throws {@link RouterPathConflictError} if a route with the same path already exists
   */
  addRoutes(routes: Readonly<Route<Name>[]> | Route<Name>[]): Router<Name> {
    routes.forEach(this.addRoute.bind(this));
    return this;
  }

  /**
   * Remove an existing route by its name.
   *
   * @param route - Partial route with name or path
   */
  removeRoute({ path, name }: Pick<Route<Name>, 'name' | 'path'>): boolean {
    //  If no name or path is provided, return false
    if (!name && !path) return false;

    //  Check if the name or path provided matches the registered name or path when both are provided
    const registeredPath = name ? this.#routeNameMap.get(name) : undefined;
    const registeredName = path ? this.#routes.get(path)?.name : undefined;
    if (name && path) {
      if (registeredPath && registeredPath !== path) throw new RouterNamePathMismatchError<Name>({ name, path, registeredPath });
      if (registeredName && registeredName !== name) throw new RouterNamePathMismatchError<Name>({ name, path, registeredName });
    }

    const _path = path || registeredPath;
    const _name = name || registeredName;
    let result = false;
    if (_name) result = this.#routeNameMap.delete(_name);
    if (_path) result = this.#routes.delete(_path) || result;
    if (result) Logger.debug(this.#log, 'Removed route', { name: _name, path: _path, routes: this.routes, names: this.#namedRoutes });
    return result;
  }

  /**
   * Remove multiple routes by their name or path.
   * @param routes - Array of routes to remove
   *
   * @returns Array of removed routes
   */
  removeRoutes(routes: Readonly<Route<Name>[]> | Route<Name>[]): Route<Name>[] {
    return routes.filter(this.removeRoute.bind(this));
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
   * Add a navigation listener that is executed when the navigation is triggered but before the route is resolved.
   *
   * @param listener - navigation listener to add
   *
   * @returns a function that removes the registered listener
   */
  onStart(listener: NavigationListener<Name>): () => void {
    this.#onStartListeners.add(listener);
    return () => this.#onStartListeners.delete(listener);
  }

  /**
   * Add a navigation listener that is executed when the navigation is triggered and the route is resolved.
   *
   * @param listener - navigation listener to add
   *
   * @returns a function that removes the registered listener
   */
  onEnd(listener: NavigationEndListener<Name>): () => void {
    this.#onEndListeners.add(listener);
    return () => this.#onEndListeners.delete(listener);
  }

  /**
   * Add a navigation listener that is executed when an error occurs during navigation.
   *
   * @param listener - navigation listener to add
   *
   * @returns a function that removes the registered listener
   */
  onError(listener: NavigationErrorListener<Name>): () => void {
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
      strict = this.options?.strict,
      failOnNotFound = this.options?.failOnNotFound,
      base = this.options?.base,
      hash = this.options?.hash,
    }: Omit<RouterNavigationOptions, 'metaAsState' | 'nameAsTitle'> & { from?: Route<Name> } = {},
  ): ResolvedRoute<Name> {
    const { query, params, path, name, stripQuery, stripHash, stripTrailingHash } = to;

    let _path: string | undefined = path;
    //  if 'name' is present, use namedRoutes to resolve path
    if (!path && name) _path = this.#routeNameMap.get(name);
    if (!_path) throw new NavigationNotFoundError({ to, from }, { message: 'No path could be resolved from the provided location' });

    // strip hash from path
    if (hash) {
      if (_path.startsWith('/#')) _path = _path.slice(2);
      if (_path.startsWith('#')) _path = _path.slice(1);
    }
    //  if relative path, use from and compute absolute path
    if (_path?.startsWith('.')) {
      if (!from) throw new NavigationNotFoundError({ to, from }, { message: 'Relative path provided but no current location could be found' });
      _path = computeAbsolutePath(from?.path ?? '', _path);
    }
    if (!_path.startsWith('/')) _path = `/${_path}`;

    // Attempt to find route by path
    let route: ParsedRoute<Name> | undefined = this.#routes.get(_path);

    //  inject params into path
    if (_path) _path = replaceTemplateParams(_path, { ...route?.params, ...params });

    //  Find exact match
    if (!route) route = this.routes.find(r => r.matcher.match(_path, true));

    //  If no route found, find first match (if strict is false)
    if (!route && !strict) route = this.routes.find(r => r.matcher.match(_path));

    //  if no route found and failOnNotFound is true, throw NavigationNotFoundError
    if (!route && failOnNotFound) throw new NavigationNotFoundError({ to, from });

    const { wildcards, params: _params } = route?.matcher.extract(_path) ?? {};

    //  use hash, path, and query to resolve new href
    const { href, search } = resolveNewHref(_path, {
      base,
      hash,
      stripQuery,
      stripHash,
      stripTrailingHash,
      query: { ...route?.query, ...query },
      current: this.#browser.href,
    });
    Logger.debug(this.#log, 'Route resolved', { to, from, route, path: _path, href, search, wildcards, params: _params });

    //  return resolved route
    return {
      route,
      path: _path,
      name: route?.name,
      href,
      query: Object.fromEntries(search),
      params: { ...params, ..._params },
      wildcards: { ...wildcards },
    } satisfies ResolvedRoute<Name>;
  }

  /**
   * Execute all the navigation guards before navigating to a new route.
   *
   * @param to - Route location to navigate to
   * @param navigation - The current navigation event
   *
   * @private
   */
  async #navigationGuards(to: ResolvedRoute<Name>, navigation: NavigationEvent<Name>): Promise<false | RouteNavigation<Name>> {
    let result: null | boolean | RouteNavigation<Name>;
    result = preventNavigation(await this.#route?.beforeLeave?.(navigation), navigation);
    if (!Object.is(this.#routing, navigation)) navigation.cancel();
    if (result) return result;
    result = preventNavigation(await to.route?.beforeEnter?.(navigation), navigation);
    if (!Object.is(this.#routing, navigation)) navigation.cancel();
    if (result) return result;
    result = await raceUntil(
      Array.from(this.#beforeEachGuards).map(async guard => {
        if (!Object.is(this.#routing, navigation)) navigation.cancel();
        return preventNavigation(await guard(navigation), navigation);
      }),
      (_result: boolean | RouteNavigation<Name>) => !!_result,
    ).outer;
    return result ?? false;
  }

  /**
   * Internal method to redirect to a new navigation location.
   * @param to - Route location to navigate to
   * @param options - Additional options to pass to the resolver
   * @private
   */
  async #redirect(to: RouteNavigation<Name>, options: RouterNavigationOptions = {}): Promise<ResolvedRouterLocationSnapshot<Name>> {
    const resolved = this.resolve(to, options);
    return this.#navigate(resolved, options);
  }

  /**
   * Navigate to a new URL by updating the current location and route.
   *
   * @param to - Route location to navigate to
   * @param from - Route location to navigate from
   * @param options - Additional options to pass to the resolver
   *
   * @throws {@link NavigationFailure} if the navigation is aborted, cancelled, or not found.
   */
  async #navigate(
    to: ResolvedRoute<Name>,
    options: RouterNavigationOptions = {},
    from: ResolvedRouterLocationSnapshot<Name> = this.snapshot,
  ): Promise<ResolvedRouterLocationSnapshot<Name>> {
    const { route, ...location } = to;
    // Merge the options with the router options
    const _options: RouterNavigationOptions = { ...this.options, ...options };
    const _location: RouterLocation<Name> = {
      origin: location.href.origin,
      base: _options.base,
      ...location,
    };

    // If the route is the same, return the current snapshot
    if (!_options.force && isResolvedLocationEqual(this.current, { route, location: _location })) return this.snapshot;

    // Reset the error state
    this.#error = undefined;

    // Update the routing state
    const navigation = new NavigationEvent<Name>(to, from);
    // Set the new navigation as the current routing event
    this.#routing = navigation;

    // Broadcast the navigation start event
    this.#onStartListeners.forEach(listener => listener(navigation));

    try {
      // Execute navigation guards
      const blockOrRedirect = await this.#navigationGuards(to, navigation);
      // If the navigation was cancelled return the new promise
      if (!Object.is(this.#routing, navigation)) navigation.cancel();

      // If a guard returns a redirect, navigate to the new location and replace state
      if (typeof blockOrRedirect === 'object' && _options.followGuardRedirects) {
        Logger.info(this.#log, 'Guard redirect', { ...navigation, redirect: blockOrRedirect });
        navigation.redirect(blockOrRedirect);
        return this.#redirect(blockOrRedirect, { ..._options, followGuardRedirects: false });
      }

      // If the route is a redirect, navigate to the new location and replace state
      if (route?.redirect) {
        Logger.info(this.#log, 'Route redirect', { ...navigation, redirect: route.redirect });
        navigation.redirect(route.redirect);
        return this.#redirect(route.redirect, _options);
      }

      // Update the current route and location
      this.#route = route;
      this.#location = _location;

      Logger.info(this.#log, 'Navigated to', to?.name || to?.path, navigation);
      navigation.complete();
      return this.snapshot;
    } catch (error) {
      // If the navigation was already cancelled, rethrow the error
      if (error instanceof NavigationCancelledError) throw error;
      // If the navigation was cancelled throw cancellation error
      if (!Object.is(this.#routing, navigation)) navigation.cancel(error);
      this.#error = error;

      // Broadcast the navigation error event
      this.#onErrorListeners.forEach(listener => listener(error, navigation));
      Logger.error(this.#log, 'Navigation error', { ...navigation, error });
      navigation.fail(error);
      throw error;
    } finally {
      // Only clear the routing state if the navigation is still active
      if (Object.is(this.#routing, navigation)) {
        this.#routing = undefined;

        // Broadcast the navigation end event
        this.#onEndListeners.forEach(listener => listener(navigation, this.snapshot));
      }
    }
  }

  /**
   * Sync the router with the current location.
   * @private
   */
  async sync(): Promise<ResolvedRouterLocationSnapshot<Name>> {
    let path: string = this.#browser.pathname;
    if (this.#base && !path.startsWith(this.#base)) {
      this.#location = undefined;
      this.#route = undefined;
      return Logger.debug(this.#log, 'Not on base path, ignoring sync', { path, base: this.#base });
    }
    if (this.#hash) path = this.#browser.hash.slice(1);
    else if (this.#base) path = path.slice(this.#base.length);
    if (!path) path = '/';
    const resolve = this.resolve({ path });
    return this.#navigate(resolve);
  }

  /**
   * Internal method to update the history state and navigate to a new URL.
   *
   * @param method - History method to use (pushState or replaceState)
   * @param to - Route location to navigate to
   * @param options - Additional options to pass to the resolver
   *
   * @throws {@link NavigationNotFoundError} if the route is not found.
   * @throws {@link NavigationCancelledError} if the navigation is cancelled before completion.
   * @throws {@link NavigationAbortedError} if the navigation is aborted by a navigation guard.
   * @throws {@link ParsingError} if the URL cannot be parsed.
   *
   * @private
   */
  async #historyWrapper(
    method: 'pushState' | 'replaceState',
    to: RouteNavigation<Name>,
    options: RouterNavigationOptions,
  ): Promise<ResolvedRouterLocationSnapshot<Name>> {
    const resolved = this.resolve(to, options);
    const routed = await this.#navigate(resolved, options);
    const { state, title } = routeToHistoryState(routed, { ...options, state: to.state });
    try {
      this.#history[method](state, title ?? '', routed.location?.href);
      if (title) document.title = title;
      Logger.debug(this.#log, 'State change', { method, resolved, routed, state, title });
      return routed;
    } catch (error) {
      Logger.error(this.#log, 'History error', { method, error, resolved, routed, state, title });
      throw error;
    }
  }

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
  async push(to: RouteNavigation<Name>, options: RouterNavigationOptions = {}): Promise<ResolvedRouterLocationSnapshot<Name>> {
    return this.#historyWrapper('pushState', to, { ...this.options, ...options });
  }

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
   *
   */
  async replace(to: RouteNavigation<Name>, options: RouterNavigationOptions = {}): Promise<ResolvedRouterLocationSnapshot<Name>> {
    return this.#historyWrapper('replaceState', to, { ...this.options, ...options });
  }

  /**
   * Go back in history if possible by calling `history.back()`.
   * Equivalent to `router.go(-1)`.
   */
  async back(): Promise<ResolvedRouterLocationSnapshot<Name>> {
    this.#history.back();
    if (!this.#listening) return this.sync();
    return this.snapshot;
  }

  /**
   * Go forward in history if possible by calling `history.forward()`.
   * Equivalent to `router.go(1)`.
   */
  async forward(): Promise<ResolvedRouterLocationSnapshot<Name>> {
    this.#history.forward();
    if (!this.#listening) return this.sync();
    return this.snapshot;
  }

  /**
   * Allows you to move forward or backward through the history.
   * Calls `history.go()`.
   *
   * @param delta - The position in the history to which you want to move, relative to the current page
   */
  async go(delta: number): Promise<ResolvedRouterLocationSnapshot<Name>> {
    this.#history.go(delta);
    if (!this.#listening) return this.sync();
    return this.snapshot;
  }
}
