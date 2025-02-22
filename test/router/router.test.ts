/// <reference types="navigation-api-types" />

import { wait } from '@dvcol/common-utils/common/promise';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { MockInstance } from 'vitest';

import type { NavigationNotFoundError, NavigationResolveError } from '~/models/error.model.js';

import type { Route, RouteParams, RouteQuery } from '~/models/route.model.js';

import type { RouterOptions } from '~/models/router.model.js';

import { ErrorTypes, NavigationAbortedError, NavigationCancelledError } from '~/models/error.model.js';
import { RouterScrollConstant, RouterStateConstant } from '~/models/router.model.js';
import { NavigationEvent } from '~/router/event.svelte.js';

import { Router } from '~/router/router.svelte.js';
import { Logger } from '~/utils/index.js';

describe('router', () => {
  const HomeRoute: Route = {
    name: 'home',
    path: '/home',
  };

  const PathRoute: Route = {
    name: 'path',
    path: '/path',
  };

  const OtherRoute: Route = {
    name: 'other',
    path: '/other',
  };

  const ChildRoute: Route = {
    name: 'child',
    path: '/child',
  };

  const OtherChildRoute: Route = {
    name: 'other-child',
    path: '/other-child',
  };

  const ParentRoute: Route = {
    name: 'parent',
    path: '/parent',
    children: [ChildRoute, OtherChildRoute],
  };

  const ParamRoute: Route = {
    name: 'param',
    path: '/param/:id/user/:firstName:?/:lastName',
    params: {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
    },
  };

  const QueryRoute: Route = {
    name: 'query',
    path: '/query',
    query: {
      page: 1,
      limit: 10,
    },
  };

  const ParamQueryRoute: Route = {
    name: 'param-query',
    path: '/param-query/:id/user/:firstName/:lastName',
    params: {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
    },
    query: {
      page: 1,
      limit: 10,
    },
  };

  const TitleRoute: Route = {
    name: 'title',
    path: '/title',
    title: ':notification:? My Title :subtitle:?',
  };

  const RedirectRoute: Route = {
    name: 'redirect',
    path: '/redirect',
    redirect: {
      name: PathRoute.name,
    },
  };

  const WildcardRoute: Route = {
    name: 'wildcard',
    path: '/wildcard/*',
    redirect: {
      name: PathRoute.name,
    },
  };

  const WildcardSegmentRoute: Route = {
    name: 'wildcard-segment',
    path: '/*/segment',
  };

  const resolveError = new Error('Resolve error');
  const ResolveErrorRoute: Route = {
    name: 'resolve-error',
    path: '/resolve-error',
    beforeResolve: () => resolveError,
  };

  const ResolveErrorStringRoute: Route = {
    name: 'resolve-error-string',
    path: '/resolve-error-string',
    beforeResolve: () => 'string error',
  };

  const ResolveErrorBooleanRoute: Route = {
    name: 'resolve-error-boolean',
    path: '/resolve-error-boolean',
    beforeResolve: () => false,
  };

  const promiseError = new Error('Promise error');
  const ResolveErrorPromiseRoute: Route = {
    name: 'resolve-error-promise',
    path: '/resolve-error-promise',
    beforeResolve: () => Promise.resolve(promiseError),
  };

  const routes: Route[] = [
    HomeRoute,
    PathRoute,
    OtherRoute,
    ParentRoute,
    ParamRoute,
    QueryRoute,
    ParamQueryRoute,
    TitleRoute,
    RedirectRoute,
    WildcardRoute,
    WildcardSegmentRoute,
    ResolveErrorRoute,
    ResolveErrorStringRoute,
    ResolveErrorBooleanRoute,
    ResolveErrorPromiseRoute,
  ];

  let router: Router;
  let resolve: MockInstance;
  let sync: MockInstance;
  let push: MockInstance;
  let replace: MockInstance;

  const getRouter = async (options: RouterOptions = { routes }, clearInit = false) => {
    const _router = new Router(options);
    // Flush the microtask queue to ensure the router is initialized
    await wait();
    resolve = vi.spyOn(_router, 'resolve');
    sync = vi.spyOn(_router, 'sync');
    push = vi.spyOn(_router, 'push');
    replace = vi.spyOn(_router, 'replace');
    if (clearInit) vi.clearAllMocks();
    return _router;
  };

  const listeners = new Set<EventListener>();
  const navigation = {
    addEventListener: (type: string, fn: EventListener) => listeners.add(fn),
    removeEventListener: (type: string, fn: EventListener) => listeners.delete(fn),
    dispatchEvent: (event: Event) => listeners.forEach(fn => fn(event)),
  } as unknown as Navigation;

  const addNavigationEventListener = vi.spyOn(navigation, 'addEventListener');
  const removeNavigationEventListener = vi.spyOn(navigation, 'removeEventListener');

  const addWindowEventListener = vi.spyOn(window, 'addEventListener');
  const removeWindowEventListener = vi.spyOn(window, 'removeEventListener');

  afterEach(() => {
    router?.destroy();
    router = undefined;
    window.location.hash = '';
    window.history.replaceState(null, '', '/');
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a new router with the provided routes', async () => {
      expect.assertions(routes.length * 4);
      router = await getRouter();
      routes.forEach(route => {
        expect(router.routes.filter((r: Route) => r.name === route.name && r.path === route.path)).toHaveLength(1);
        expect(router.hasRoute(route)).toBeTruthy();
        expect(router.hasRouteName(route.name)).toBeTruthy();
        expect(router.hasRoutePath(route.path)).toBeTruthy();
      });
    });

    it('should create a new router with the default options', async () => {
      expect.assertions(10);
      router = await getRouter();
      expect(router.options.base).toBe('');
      expect(router.options.hash).toBeFalsy();
      expect(router.options.strict).toBeFalsy();
      expect(router.options.failOnNotFound).toBeFalsy();
      expect(router.options.failOnNotFound).toBeFalsy();
      expect(router.options.metaAsState).toBeFalsy();
      expect(router.options.nameAsTitle).toBeFalsy();
      expect(router.options.followGuardRedirects).toBeTruthy();
      expect(router.options.caseSensitive).toBeFalsy();
      expect(router.options.listen).toBe('history');
    });

    it('should create a new router with the provided options', async () => {
      expect.assertions(10);
      router = await getRouter({
        routes,
        base: '/base',
        hash: true,
        strict: true,
        failOnNotFound: true,
        metaAsState: true,
        nameAsTitle: true,
        followGuardRedirects: false,
        caseSensitive: true,
        listen: false,
      });
      expect(router.options.base).toBe('/base');
      expect(router.options.hash).toBeTruthy();
      expect(router.options.strict).toBeTruthy();
      expect(router.options.failOnNotFound).toBeTruthy();
      expect(router.options.failOnNotFound).toBeTruthy();
      expect(router.options.metaAsState).toBeTruthy();
      expect(router.options.nameAsTitle).toBeTruthy();
      expect(router.options.followGuardRedirects).toBeFalsy();
      expect(router.options.caseSensitive).toBeTruthy();
      expect(router.options.listen).toBeFalsy();
    });
  });

  describe('addRoute', () => {
    const NewRoute: Route = {
      name: 'new',
      path: '/new',
    };

    const NewChildRoute: Route = {
      name: 'new-child',
      path: '/new-child',
    };

    beforeEach(async () => {
      router = await getRouter();
    });

    it('should add a new route to the router', () => {
      expect.assertions(2);

      expect(router.hasRoute(NewRoute)).toBeFalsy();

      router.addRoute(NewRoute);

      expect(router.hasRoute(NewRoute)).toBeTruthy();
    });

    it('should add a new route to the router with no name', () => {
      expect.assertions(2);

      expect(router.hasRoute(NewRoute)).toBeFalsy();

      router.addRoute({ ...NewRoute, name: undefined });

      expect(router.hasRoute(NewRoute)).toBeTruthy();
    });

    it('should add a new route to the router with children', () => {
      expect.assertions(4);

      expect(router.hasRoute(NewRoute)).toBeFalsy();
      expect(router.hasRoute(NewChildRoute)).toBeFalsy();

      router.addRoute({ ...NewRoute, children: [NewChildRoute] });

      expect(router.hasRoute(NewRoute)).toBeTruthy();
      expect(router.hasRoute(NewChildRoute)).toBeTruthy();
    });

    it('should add multiple routes to the router', () => {
      expect.assertions(4);

      expect(router.hasRoute(NewRoute)).toBeFalsy();
      expect(router.hasRoute(NewChildRoute)).toBeFalsy();

      router.addRoutes([NewRoute, NewChildRoute]);

      expect(router.hasRoute(NewRoute)).toBeTruthy();
      expect(router.hasRoute(NewChildRoute)).toBeTruthy();
    });

    it('should throw a RouterNameConflictError if a route with the same name already exists', () => {
      expect.assertions(1);

      expect(() => router.addRoute(OtherRoute)).toThrow(`A route with the name "${OtherRoute.name}" already exists`);
    });

    it('should throw a RouterPathConflictError if a route with the same path already exists', () => {
      expect.assertions(1);

      expect(() => router.addRoute({ ...OtherRoute, name: undefined })).toThrow(`A route with the path "${OtherRoute.path}" already exists`);
    });
  });

  describe('removeRoute', () => {
    beforeEach(async () => {
      router = await getRouter();
    });

    it('should remove an existing route by its name', () => {
      expect.assertions(3);

      expect(router.hasRoute(OtherRoute)).toBeTruthy();

      expect(router.removeRoute(OtherRoute)).toBeTruthy();

      expect(router.hasRoute(OtherRoute)).toBeFalsy();
    });

    it('should remove an existing route by its path', () => {
      expect.assertions(3);

      expect(router.hasRoute(OtherRoute)).toBeTruthy();

      expect(router.removeRoute({ ...OtherRoute, name: undefined })).toBeTruthy();

      expect(router.hasRoute(OtherRoute)).toBeFalsy();
    });

    it('should remove multiple routes', () => {
      expect.assertions(5);

      expect(router.hasRoute(PathRoute)).toBeTruthy();
      expect(router.hasRoute(OtherRoute)).toBeTruthy();

      expect(router.removeRoutes([PathRoute, OtherRoute])).toHaveLength(2);

      expect(router.hasRoute(PathRoute)).toBeFalsy();
      expect(router.hasRoute(OtherRoute)).toBeFalsy();
    });

    it('should return false if the route does not exist', () => {
      expect.assertions(2);

      const NotFound: Route = { name: 'not-found', path: '/not-found' };

      expect(router.hasRoute(NotFound)).toBeFalsy();
      expect(router.removeRoute(NotFound)).toBeFalsy();
    });

    it('should return false if no name or path is provided', () => {
      expect.assertions(2);
      expect(router.removeRoute({})).toBeFalsy();
      expect(router.removeRoute({ name: undefined, path: undefined })).toBeFalsy();
    });

    it('should throw a RouterNamePathMismatchError if the path provided and registered do not match', () => {
      expect.assertions(1);
      expect(() => router.removeRoute({ ...OtherRoute, path: '/other-path' })).toThrow(
        `Route path "/other-path" with name "${OtherRoute.name}" does not match registered path "${OtherRoute.path}"`,
      );
    });

    it('should throw a RouterNamePathMismatchError if the name provided and registered do not match', () => {
      expect.assertions(1);
      expect(() => router.removeRoute({ ...OtherRoute, name: 'other-name' })).toThrow(
        `Route path "${OtherRoute.path}" with name "other-name" does not match registered name "${OtherRoute.name}"`,
      );
    });
  });

  describe('hooks', () => {
    describe('beforeEach', () => {
      let beforeEachFn: MockInstance;

      beforeEach(() => {
        beforeEachFn = vi.fn();
      });

      it('should instantiate a new router with a beforeEach navigation guard', async () => {
        expect.assertions(2);
        router = await getRouter({
          routes,
          beforeEach: beforeEachFn,
        });

        await router.push(PathRoute);

        expect(beforeEachFn).toHaveBeenCalledTimes(1);
        expect(beforeEachFn).toHaveBeenCalledWith(expect.any(NavigationEvent));
      });

      it('should add a navigation guard to be called before each navigation', async () => {
        expect.assertions(2);
        router = await getRouter();

        router.beforeEach(beforeEachFn);

        await router.push(PathRoute);

        expect(beforeEachFn).toHaveBeenCalledTimes(1);
        expect(beforeEachFn).toHaveBeenCalledWith(expect.any(NavigationEvent));
      });

      it('should remove a navigation guard when the returned function is called', async () => {
        expect.assertions(1);
        router = await getRouter();

        const remove = router.beforeEach(beforeEachFn);
        remove();

        await router.push(PathRoute);

        expect(beforeEachFn).not.toHaveBeenCalled();
      });
    });

    describe('onStart', () => {
      let onStartFn: MockInstance;

      beforeEach(() => {
        onStartFn = vi.fn();
      });

      it('should instantiate a new router with an onStart listener', async () => {
        expect.assertions(2);
        router = await getRouter({
          routes,
          onStart: onStartFn,
        });

        await router.push(PathRoute);

        expect(onStartFn).toHaveBeenCalledTimes(1);
        expect(onStartFn).toHaveBeenCalledWith(expect.any(NavigationEvent));
      });

      it('should add a listener to be called when a navigation starts', async () => {
        expect.assertions(2);
        router = await getRouter();

        router.onStart(onStartFn);

        await router.push(PathRoute);

        expect(onStartFn).toHaveBeenCalledTimes(1);
        expect(onStartFn).toHaveBeenCalledWith(expect.any(NavigationEvent));
      });

      it('should remove a listener when the returned function is called', async () => {
        expect.assertions(1);
        router = await getRouter();

        const remove = router.onStart(onStartFn);
        remove();

        await router.push(PathRoute);

        expect(onStartFn).not.toHaveBeenCalled();
      });
    });

    describe('onEnd', () => {
      let onEndFn: MockInstance;

      beforeEach(() => {
        onEndFn = vi.fn();
      });

      it('should instantiate a new router with an onEnd listener', async () => {
        expect.assertions(2);
        router = await getRouter({
          routes,
          onEnd: onEndFn,
        });

        await router.push(PathRoute);

        expect(onEndFn).toHaveBeenCalledTimes(1);
        expect(onEndFn).toHaveBeenCalledWith(expect.any(NavigationEvent), router.snapshot);
      });

      it('should add a listener to be called when a navigation ends', async () => {
        expect.assertions(2);

        router = await getRouter();

        router.onEnd(onEndFn);

        await router.push(PathRoute);

        expect(onEndFn).toHaveBeenCalledTimes(1);
        expect(onEndFn).toHaveBeenCalledWith(expect.any(NavigationEvent), router.snapshot);
      });

      it('should remove a listener when the returned function is called', async () => {
        expect.assertions(1);

        router = await getRouter();

        const remove = router.onEnd(onEndFn);
        remove();

        await router.push(PathRoute);

        expect(onEndFn).not.toHaveBeenCalled();
      });
    });

    describe('onError', () => {
      const error = new Error('Navigation guard error');
      const onErrorFn = vi.fn();
      const beforeEachErrorFn = vi.fn().mockRejectedValue(error);

      it('should instantiate a new router with an onError listener', async () => {
        expect.assertions(2);
        router = await getRouter({
          routes,
          onError: onErrorFn,
          beforeEach: beforeEachErrorFn,
        });

        try {
          await router.push(PathRoute);
        } catch {
          // ignore error
        } finally {
          expect(onErrorFn).toHaveBeenCalledTimes(1);
          expect(onErrorFn).toHaveBeenCalledWith(error, expect.any(NavigationEvent));
        }
      });

      it('should add a listener to be called when a navigation has an error', async () => {
        expect.assertions(2);

        router = await getRouter({
          routes,
          beforeEach: beforeEachErrorFn,
        });

        router.onError(onErrorFn);

        try {
          await router.push(PathRoute);
        } catch {
          // ignore error
        } finally {
          expect(onErrorFn).toHaveBeenCalledTimes(1);
          expect(onErrorFn).toHaveBeenCalledWith(error, expect.any(NavigationEvent));
        }
      });

      it('should remove a listener when the returned function is called', async () => {
        expect.assertions(1);

        router = await getRouter({
          routes,
          beforeEach: beforeEachErrorFn,
        });

        const remove = router.onError(onErrorFn);
        remove();

        try {
          await router.push(PathRoute);
        } catch {
          // ignore error
        } finally {
          expect(onErrorFn).not.toHaveBeenCalled();
        }
      });
    });
  });

  describe('resolve', () => {
    const common = () => {
      it('should resolve a route from a name', async () => {
        expect.assertions(4);

        const route = await router.resolve({ name: HomeRoute.name });

        expect(route).toBeDefined();
        expect(route.name).toBe(HomeRoute.name);
        expect(route.path).toBe(HomeRoute.path);
        expect(route.route.path).toBe(HomeRoute.path);
      });

      it('should resolve a route from a path', async () => {
        expect.assertions(4);

        const route = await router.resolve({ path: PathRoute.path });

        expect(route).toBeDefined();
        expect(route.name).toBe(PathRoute.name);
        expect(route.path).toBe(PathRoute.path);
        expect(route.route.path).toBe(PathRoute.path);
      });

      it('should resolve a route from a partial sub-path', async () => {
        expect.assertions(4);

        const route = await router.resolve({ path: '/parent/ch' });

        expect(route).toBeDefined();
        expect(route.name).toBe(ParentRoute.name);
        expect(route.path).toBe('/parent/ch');
        expect(route.route.name).toBe(ParentRoute.name);
      });

      it('should resolve a route from a name in strict mode', async () => {
        expect.assertions(4);

        const route = await router.resolve({ name: HomeRoute.name }, { strict: true });

        expect(route).toBeDefined();
        expect(route.name).toBe(HomeRoute.name);
        expect(route.path).toBe(HomeRoute.path);
        expect(route.route.path).toBe(HomeRoute.path);
      });

      it('should resolve a route from a path in strict mode', async () => {
        expect.assertions(4);

        const route = await router.resolve({ path: PathRoute.path }, { strict: true });

        expect(route).toBeDefined();
        expect(route.name).toBe(PathRoute.name);
        expect(route.path).toBe(PathRoute.path);
        expect(route.route.path).toBe(PathRoute.path);
      });

      it('should not resolve a route from a partial sub-path in strict mode', async () => {
        expect.assertions(4);

        const route = await router.resolve({ path: '/parent/ch' }, { strict: true });

        expect(route).toBeDefined();
        expect(route.name).toBeUndefined();
        expect(route.path).toBe('/parent/ch');
        expect(route.route).toBeUndefined();
      });

      it('should resolve a route from a relative location', async () => {
        expect.assertions(5);
        await router.push(ParentRoute);

        expect(router.route.name).toBe(ParentRoute.name);

        const route = await router.resolve({ path: './child' });

        expect(route).toBeDefined();
        expect(route.name).toBe(ChildRoute.name);
        expect(route.path).toBe('/parent/child');
        expect(route.route.path).toBe('/parent/child');
      });

      it('should resolve a route from a location with param parameters', async () => {
        expect.assertions(5);

        const path = '/param/2/user/Jane/Smith';
        const route = await router.resolve({ path });

        expect(route).toBeDefined();
        expect(route.name).toBe(ParamRoute.name);
        expect(route.path).toBe(path);
        expect(route.route.path).toBe(ParamRoute.path);
        expect(route.params).toStrictEqual({ id: '2', firstName: 'Jane', lastName: 'Smith' });
      });

      it('should resolve a route from a name with default parameters', async () => {
        expect.assertions(5);

        const route = await router.resolve({ name: ParamRoute.name });

        expect(route).toBeDefined();
        expect(route.name).toBe(ParamRoute.name);
        expect(route.path).toBe('/param/1/user/John/Doe');
        expect(route.route.path).toBe(ParamRoute.path);
        expect(route.params).toStrictEqual({ id: '1', firstName: 'John', lastName: 'Doe' });
      });

      it('should resolve a route from a location with query parameters', async () => {
        expect.assertions(5);

        const route = await router.resolve({ path: QueryRoute.path, query: { page: '2', limit: '5' } });

        expect(route).toBeDefined();
        expect(route.name).toBe(QueryRoute.name);
        expect(route.path).toBe(QueryRoute.path);
        expect(route.route.path).toBe(QueryRoute.path);
        expect(route.query).toStrictEqual({ page: '2', limit: '5' });
      });

      it('should resolve a route from a location with default query parameters', async () => {
        expect.assertions(5);

        const route = await router.resolve({ name: QueryRoute.name });

        expect(route).toBeDefined();
        expect(route.name).toBe(QueryRoute.name);
        expect(route.path).toBe(QueryRoute.path);
        expect(route.route.path).toBe(QueryRoute.path);
        expect(route.query).toStrictEqual({ page: '1', limit: '10' });
      });

      it('should resolve a route from a location with both param and query parameters', async () => {
        expect.assertions(6);

        const path = '/param-query/2/user/Jane/Smith';
        const route = await router.resolve({ path, query: { page: '2', limit: '5' } });

        expect(route).toBeDefined();
        expect(route.name).toBe(ParamQueryRoute.name);
        expect(route.path).toBe(path);
        expect(route.route.path).toBe(ParamQueryRoute.path);
        expect(route.params).toStrictEqual({ id: '2', firstName: 'Jane', lastName: 'Smith' });
        expect(route.query).toStrictEqual({ page: '2', limit: '5' });
      });

      it('should resolve a route and keep the query parameters from the previous location', async () => {
        expect.assertions(5);

        await router.push({ name: QueryRoute.name, query: { page: '2', limit: '5' } });

        const route = await router.resolve({ name: PathRoute.name });

        expect(route).toBeDefined();
        expect(route.name).toBe(PathRoute.name);
        expect(route.path).toBe(PathRoute.path);
        expect(route.route.path).toBe(PathRoute.path);
        expect(route.query).toStrictEqual({ page: '2', limit: '5' });
      });

      it('should resolve a route and strip the query parameters from the previous location', async () => {
        expect.assertions(5);

        await router.push({ name: QueryRoute.name, query: { page: '2', limit: '5' } });

        const route = await router.resolve({ name: PathRoute.name, stripQuery: true });

        expect(route).toBeDefined();
        expect(route.name).toBe(PathRoute.name);
        expect(route.path).toBe(PathRoute.path);
        expect(route.route.path).toBe(PathRoute.path);
        expect(route.query).toStrictEqual({});
      });

      it('should resolve a wildcard route from a location', async () => {
        expect.assertions(2);

        const route = await router.resolve({ path: '/wildcard/something' });

        expect(route).toBeDefined();
        expect(route.name).toBe(WildcardRoute.name);
      });

      it('should resolve a wildcard segment route from a location', async () => {
        expect.assertions(2);

        const route = await router.resolve({ path: '/something/segment' });

        expect(route).toBeDefined();
        expect(route.name).toBe(WildcardSegmentRoute.name);
      });

      it('should fail with a NavigationNotFoundError if no path can be resolved', async () => {
        expect.assertions(2);

        let error: NavigationNotFoundError;
        try {
          await router.resolve({ name: '/not-found' }, { failOnNotFound: true });
        } catch (e) {
          error = e;
        } finally {
          expect(error.message).toBe('No path could be resolved from the provided location');
          expect(error.type).toBe(ErrorTypes.NAVIGATION_NOT_FOUND);
        }
      });

      it('should fail with a NavigationNotFoundError if a relative path reference could not be resolved', async () => {
        expect.assertions(2);

        let error: NavigationNotFoundError;
        try {
          await router.resolve({ path: './not-found' }, { failOnNotFound: true, from: null });
        } catch (e) {
          error = e;
        } finally {
          expect(error.message).toBe('Relative path provided but no current location could be found');
          expect(error.type).toBe(ErrorTypes.NAVIGATION_NOT_FOUND);
        }
      });

      it('should fail with a ParsingRelativePathError if a relative path could not be resolved', async () => {
        expect.assertions(2);

        let error: ParsingRelativePathError;
        try {
          await router.resolve({ path: '../../not-found' }, { failOnNotFound: true, from: { path: '/' } });
        } catch (e) {
          error = e;
        } finally {
          expect(error.message).toBe('Error parsing relative path "../../not-found" from parent path "/"');
          expect(error.type).toBe('PARSING_RELATIVE_PATH_ERROR');
        }
      });

      it('should fail with a NavigationNotFoundError if no route can be resolved and failOnNotFound is true', async () => {
        expect.assertions(2);

        let error: NavigationNotFoundError;
        try {
          await router.resolve({ path: '/not-found' }, { failOnNotFound: true });
        } catch (e) {
          error = e;
        } finally {
          expect(error.message).toBe('Navigation failed: NAVIGATION_NOT_FOUND');
          expect(error.type).toBe(ErrorTypes.NAVIGATION_NOT_FOUND);
        }
      });

      it('should not fail with a NavigationNotFoundError if no route can be resolved and failOnNotFound is false', async () => {
        expect.assertions(3);

        const route = await router.resolve({ path: '/not-found' }, { failOnNotFound: false });

        expect(route.route).toBeUndefined();
        expect(route.name).toBeUndefined();
        expect(route.path).toBe('/not-found');
      });

      it.each([
        { name: ResolveErrorRoute.name, message: 'Failed to resolve route.', error: resolveError },
        { name: ResolveErrorStringRoute.name, message: 'string error' },
        { name: ResolveErrorBooleanRoute.name, message: 'Failed to resolve route.' },
        { name: ResolveErrorPromiseRoute.name, message: 'Failed to resolve route.', error: promiseError },
      ])('should fail with a NavigationResolveError if a resolve guard returns an error - %s', async ({ name, message, error }) => {
        expect.assertions(3);

        let err: NavigationResolveError;
        try {
          await router.resolve({ name });
        } catch (e) {
          err = e;
        } finally {
          expect(err.message).toBe(message);
          expect(err.type).toBe(ErrorTypes.NAVIGATION_ABORTED_RESOLVE);
          expect(err.error).toBe(error);
        }
      });
    };

    describe('path mode', () => {
      beforeEach(async () => {
        router = await getRouter({ routes, listen: false, hash: false });
      });

      common();

      it('should resolve a route and keep the hash from the previous location', async () => {
        expect.assertions(5);

        window.location.hash = 'hash';
        await router.push({ path: '/query', query: { page: '2', limit: '5' } });

        const route = await router.resolve({ name: PathRoute.name });

        expect(route.name).toBe(PathRoute.name);
        expect(route.path).toBe(PathRoute.path);
        expect(route.query).toStrictEqual({ page: '2', limit: '5' });
        expect(route.route.path).toBe(PathRoute.path);
        expect(route.href.hash).toBe('#hash');
      });

      it('should resolve a route and strip the hash from the previous location', async () => {
        expect.assertions(5);

        window.location.hash = 'hash';
        await router.push({ path: '/query', query: { page: '2', limit: '5' } });

        const route = await router.resolve({ name: PathRoute.name, stripHash: true });

        expect(route.name).toBe(PathRoute.name);
        expect(route.path).toBe(PathRoute.path);
        expect(route.query).toStrictEqual({ page: '2', limit: '5' });
        expect(route.route.path).toBe(PathRoute.path);
        expect(route.href.hash).toBe('');
      });
    });

    describe('hash mode', () => {
      beforeEach(async () => {
        router = await getRouter({ routes, listen: false, hash: true });
      });

      common();

      it('should resolve a route and keep the trailing hash from the previous location', async () => {
        expect.assertions(5);

        window.location.hash = '#/other#trailing-hash';
        await router.push({ path: '/query', query: { page: '2', limit: '5' } });

        const route = await router.resolve({ name: PathRoute.name });

        expect(route.name).toBe(PathRoute.name);
        expect(route.path).toBe(PathRoute.path);
        expect(route.query).toStrictEqual({ page: '2', limit: '5' });
        expect(route.route.path).toBe(PathRoute.path);
        expect(route.href.hash).toBe('#/path?page=2&limit=5#trailing-hash');
      });

      it('should resolve a route and strip the trailing hash from the previous location', async () => {
        expect.assertions(5);

        window.location.hash = '#/other#trailing-hash';
        await router.push({ path: '/query', query: { page: '2', limit: '5' } });

        const route = await router.resolve({ name: PathRoute.name, stripTrailingHash: true });

        expect(route.name).toBe(PathRoute.name);
        expect(route.path).toBe(PathRoute.path);
        expect(route.query).toStrictEqual({ page: '2', limit: '5' });
        expect(route.route.path).toBe(PathRoute.path);
        expect(route.href.hash).toBe('#/path?page=2&limit=5');
      });
    });
  });

  describe('navigate', () => {
    const getState = (
      route: Route,
      { params = {}, query = {} }: { params?: RouteParams; query?: RouteQuery } = {},
      scrollState: { x: number; y: number } = { x: globalThis?.scrollX, y: globalThis?.scrollY },
    ) => ({
      [RouterStateConstant]: {
        href: `${window.location.origin}${route.path}`,
        name: route.name,
        path: route.path,
        params,
        query,
      },
      [RouterScrollConstant]: scrollState,
    });

    const SlowRoute: Route = {
      name: 'slow',
      path: '/slow',
      beforeEnter: async () => {
        await wait(500);
      },
    };

    const AbortedRoute: Route = {
      name: 'aborted',
      path: '/aborted',
      beforeEnter: async () => {
        return false;
      },
    };

    const RedirectRouteGuard: Route = {
      name: 'redirect-guard',
      path: '/redirect-guard',
      beforeEnter: async () => {
        return { name: PathRoute.name };
      },
    };

    const SpyGuardRoute: Route = {
      name: 'spy-guard',
      path: '/spy-guard',
      beforeEnter: vi.fn().mockResolvedValue(true),
    };

    const _routes: Route[] = [...routes, SlowRoute, AbortedRoute, RedirectRouteGuard, SpyGuardRoute];

    beforeEach(async () => {
      // clear init mock to test navigate behavior only
      router = await getRouter({ routes: _routes, listen: false }, true);
    });

    const common = (method: 'push' | 'replace') => {
      const spy = vi.spyOn(window.history, `${method}State`);

      it(`should call ${method} on history for a location`, async () => {
        expect.assertions(5);

        expect(spy).not.toHaveBeenCalled();
        expect(router.route).toBeUndefined();

        await router[method](PathRoute);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(getState(PathRoute), '', `${window.location.origin}${PathRoute.path}`);
        expect(router.route.name).toBe(PathRoute.name);
      });

      it(`should call ${method} on history for a name`, async () => {
        expect.assertions(5);

        expect(spy).not.toHaveBeenCalled();
        expect(router.route).toBeUndefined();

        await router[method]({ name: PathRoute.name });

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(getState(PathRoute), '', `${window.location.origin}${PathRoute.path}`);
        expect(router.route.name).toBe(PathRoute.name);
      });

      it(`should call ${method} on history with a title`, async () => {
        expect.assertions(4);

        const oldTitle = 'Old title';
        document.title = oldTitle;
        expect(document.title).toBe(oldTitle);

        await router[method](TitleRoute);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(getState(TitleRoute), 'My Title', `${window.location.origin}${TitleRoute.path}`);
        expect(document.title).toBe('My Title');

        document.title = '';
      });

      it(`should call ${method} on history with a title and params`, async () => {
        expect.assertions(4);

        const oldTitle = 'Old title';
        document.title = oldTitle;
        expect(document.title).toBe(oldTitle);

        const params = { notification: '(1)', subtitle: '- subtitle' };
        await router[method]({ name: TitleRoute.name, params });

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(getState(TitleRoute, { params }), '(1) My Title - subtitle', `${window.location.origin}${TitleRoute.path}`);
        expect(document.title).toBe('(1) My Title - subtitle');

        document.title = '';
      });

      it(`should call ${method} on history with nameAsTitle`, async () => {
        expect.assertions(4);

        const oldTitle = 'Old title';
        document.title = oldTitle;

        expect(document.title).toBe(oldTitle);
        await router[method]({ name: PathRoute.name }, { nameAsTitle: true });

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(getState(PathRoute), PathRoute.name, `${window.location.origin}${PathRoute.path}`);
        expect(document.title).toBe(PathRoute.name);

        document.title = '';
      });

      it(`should call ${method} on history with a state`, async () => {
        expect.assertions(2);

        const state = { key: 'value' };

        await router[method]({ name: PathRoute.name, state });

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith({ ...state, ...getState(PathRoute) }, '', `${window.location.origin}${PathRoute.path}`);
      });

      it(`should navigate when the method is called`, async () => {
        expect.assertions(4);

        expect(router.route).toBeUndefined();

        await router[method](PathRoute);

        expect(router.route.name).toBe(PathRoute.name);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(getState(PathRoute), '', `${window.location.origin}${PathRoute.path}`);
      });

      it('should throw a NavigationCancelledError if the navigation is cancelled by new navigation', async () => {
        expect.assertions(7);

        const [promise] = await Promise.allSettled([router[method](SlowRoute), router[method](PathRoute)]);

        expect('reason' in promise).toBeTruthy();
        expect(promise.status).toBe('rejected');
        expect((promise as PromiseRejectedResult).reason.message).toBe('Navigation failed: NAVIGATION_CANCELLED');
        expect((promise as PromiseRejectedResult).reason.type).toBe(ErrorTypes.NAVIGATION_CANCELLED);
        expect(router.route.name).toBe(PathRoute.name);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(getState(PathRoute), '', `${window.location.origin}${PathRoute.path}`);
      });

      it('should throw a NavigationAbortedError if the navigation is aborted by a navigation guard', async () => {
        expect.assertions(5);

        let error: NavigationAbortedError;
        try {
          await router[method](AbortedRoute);
        } catch (e) {
          error = e;
        } finally {
          expect(error).toBeDefined();
          expect(error.message).toBe('Navigation failed: NAVIGATION_ABORTED');
          expect(error.type).toBe(ErrorTypes.NAVIGATION_ABORTED);
          expect(router.route).toBeUndefined();
          expect(spy).not.toHaveBeenCalled();
        }
      });

      it('should throw a NavigationNotFoundError if the route does not exist and failOnNotFound is true', async () => {
        expect.assertions(3);

        let error: NavigationNotFoundError;
        try {
          await router[method]({ name: '/not-found' }, { failOnNotFound: true });
        } catch (e) {
          error = e;
        } finally {
          expect(error).toBeDefined();
          expect(error.type).toBe(ErrorTypes.NAVIGATION_NOT_FOUND);
          expect(spy).not.toHaveBeenCalled();
        }
      });

      it('should not throw a NavigationNotFoundError if the route does not exist and failOnNotFound is false', async () => {
        expect.assertions(3);

        await router[method]({ path: '/not-found' }, { failOnNotFound: false });

        expect(router.route).toBeUndefined();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(getState({ path: '/not-found' }), '', `${window.location.origin}/not-found`);
      });

      it('should not navigate if the target route and location are the same as the current route', async () => {
        expect.assertions(7);

        expect(router.route).toBeUndefined();

        await router[method](SpyGuardRoute);

        expect(SpyGuardRoute.beforeEnter).toHaveBeenCalledTimes(1);
        expect(router.route.name).toBe(SpyGuardRoute.name);
        expect(spy).toHaveBeenCalledTimes(1);

        await router[method](SpyGuardRoute);

        expect(SpyGuardRoute.beforeEnter).toHaveBeenCalledTimes(1);
        expect(router.route.name).toBe(SpyGuardRoute.name);
        expect(spy).toHaveBeenCalledTimes(2);
      });

      it('should redirect to a new route if the target route has a redirect', async () => {
        expect.assertions(6);

        expect(router.route).toBeUndefined();

        await router[method](RedirectRoute);

        expect(router.route.name).toBe(RedirectRoute.redirect.name);
        expect(router.route.path).toBe(PathRoute.path);
        expect(router.route.path).toBe(PathRoute.path);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(getState(PathRoute), '', `${window.location.origin}${PathRoute.path}`);
      });

      it('should redirect to a new route if the target route has a redirect guard and followGuardRedirect is true', async () => {
        expect.assertions(6);

        expect(router.route).toBeUndefined();

        await router[method](RedirectRouteGuard, { followGuardRedirects: true });

        expect(router.route.name).toBe(PathRoute.name);
        expect(router.route.path).toBe(PathRoute.path);
        expect(router.route.path).toBe(PathRoute.path);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(getState(PathRoute), '', `${window.location.origin}${PathRoute.path}`);
      });

      it('should not redirect to a new route if the target route has a redirect guard and followGuardRedirect is false', async () => {
        expect.assertions(6);

        expect(router.route).toBeUndefined();

        await router[method](RedirectRouteGuard, { followGuardRedirects: false });

        expect(router.route.name).toBe(RedirectRouteGuard.name);
        expect(router.route.path).toBe(RedirectRouteGuard.path);
        expect(router.route.path).toBe(RedirectRouteGuard.path);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(getState(RedirectRouteGuard), '', `${window.location.origin}${RedirectRouteGuard.path}`);
      });
    };

    describe('push', () => common('push'));

    describe('replace', () => common('replace'));

    describe('back', () => {
      const spy = vi.spyOn(window.history, 'back');

      it('should navigate backward in the history and trigger a router sync', async () => {
        expect.assertions(2);
        const spySync = vi.spyOn(router, 'sync');

        await router.back();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spySync).toHaveBeenCalledTimes(1);
      });
    });

    describe('forward', () => {
      it('should navigate forward in the history and trigger a router sync', async () => {
        expect.assertions(2);
        const spy = vi.spyOn(window.history, 'forward');
        const spySync = vi.spyOn(router, 'sync');

        await router.forward();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spySync).toHaveBeenCalledTimes(1);
      });
    });

    describe('go', () => {
      it('should navigate forward to a location by its position in the history and trigger a router sync', async () => {
        expect.assertions(6);
        const spy = vi.spyOn(window.history, 'go');
        const spySync = vi.spyOn(router, 'sync');

        await router.go(1);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(1);
        expect(spySync).toHaveBeenCalledTimes(1);

        await router.go(5);
        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenCalledWith(5);
        expect(spySync).toHaveBeenCalledTimes(2);
      });

      it('should navigate backward to a location by its position in the history and trigger a router sync', async () => {
        expect.assertions(6);
        const spy = vi.spyOn(window.history, 'go');
        const spySync = vi.spyOn(router, 'sync');

        await router.go(-1);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(-1);
        expect(spySync).toHaveBeenCalledTimes(1);

        await router.go(-5);
        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenCalledWith(-5);
        expect(spySync).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('sync', () => {
    it('should sync the router with the current location in hash mode', async () => {
      expect.assertions(5);

      router = await getRouter({ routes, listen: false, hash: true });

      expect(window.location.hash).toBe('#/');
      expect(router.route).toBeUndefined();

      window.location.hash = `#${PathRoute.path}`;
      expect(router.route).toBeUndefined();

      await router.sync();

      expect(router.route.name).toBe(PathRoute.name);
      expect(router.route.path).toBe(PathRoute.path);
    });

    it('should sync the router with the current location in path mode', async () => {
      expect.assertions(5);

      router = await getRouter({ routes, listen: false, hash: false });

      expect(window.location.pathname).toBe('/');
      expect(router.route).toBeUndefined();

      window.history.pushState(null, '', PathRoute.path);
      expect(router.route).toBeUndefined();

      await router.sync();

      expect(router.route.name).toBe(PathRoute.name);
      expect(router.route.path).toBe(PathRoute.path);
    });

    describe('with base path', () => {
      it('should sync the router with the current location if the base path matches in path mode', async () => {
        expect.assertions(4);

        router = await getRouter({ routes, listen: false, hash: false, base: '/base' });

        expect(window.location.pathname).toBe('/');
        expect(router.route).toBeUndefined();

        window.history.pushState(null, '', `/base${PathRoute.path}`);
        expect(router.route).toBeUndefined();

        await router.sync();

        expect(router.route.name).toBe(PathRoute.name);
      });

      it('should not sync the router with the current location if the base path does not match in path mode', async () => {
        expect.assertions(4);

        router = await getRouter({ routes, listen: false, hash: false, base: '/base' });

        expect(window.location.pathname).toBe('/');
        expect(router.route).toBeUndefined();

        window.history.pushState(null, '', PathRoute.path);
        expect(router.route).toBeUndefined();

        await router.sync();

        expect(router.route).toBeUndefined();
      });

      it('should sync the router with the current location if the base path matches in hash mode', async () => {
        expect.assertions(4);

        router = await getRouter({ routes, listen: false, hash: true, base: '/base' });

        expect(window.location.hash).toBe('');
        expect(router.route).toBeUndefined();

        window.history.pushState(null, '', `/base`);
        window.location.hash = `#${PathRoute.path}`;
        expect(router.route).toBeUndefined();

        await router.sync();

        expect(router.route.name).toBe(PathRoute.name);
      });

      it('should not sync the router with the current location if the base path does not match in hash mode', async () => {
        expect.assertions(4);

        router = await getRouter({ routes, listen: false, hash: true, base: '/base' });

        expect(window.location.hash).toBe('');
        expect(router.route).toBeUndefined();

        window.location.hash = `#${PathRoute.path}`;
        expect(router.route).toBeUndefined();

        await router.sync();

        expect(router.route).toBeUndefined();
      });
    });
  });

  describe('listeners', () => {
    describe('history', () => {
      it('should subscribe to popstate events when the router is instantiated', async () => {
        expect.assertions(6);

        router = await getRouter({ routes, listen: 'history' });

        expect(router.options.listen).toBe('history');

        expect(addWindowEventListener).toHaveBeenCalledTimes(1);
        expect(addWindowEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));

        expect(removeWindowEventListener).not.toHaveBeenCalled();
        await router.destroy();

        expect(removeWindowEventListener).toHaveBeenCalledTimes(1);
        expect(removeWindowEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
      });

      it('should call sync when popstate is triggered', async () => {
        expect.assertions(6);

        router = await getRouter({ routes, listen: 'history' });
        expect(sync).not.toHaveBeenCalled();

        window.dispatchEvent(new PopStateEvent('popstate'));
        await wait();

        // popstate is ignored because the state is already synced
        expect(sync).not.toHaveBeenCalled();
        expect(router.route).toBeUndefined();

        window.history.pushState(null, '', PathRoute.path);
        window.dispatchEvent(new PopStateEvent('popstate'));
        await wait();

        expect(sync).toHaveBeenCalledTimes(1);
        expect(replace).toHaveBeenCalledWith({ path: PathRoute.path });
        expect(router.route.name).toBe(PathRoute.name);
      });

      it('should not call sync when popstate is triggered and the state is already synced', async () => {
        expect.assertions(4);

        router = await getRouter({ routes, listen: 'history' });

        await router.push(PathRoute);
        expect(resolve).toHaveBeenCalledWith(PathRoute, router.options);
        expect(sync).not.toHaveBeenCalled();

        expect(router.route.name).toBe(PathRoute.name);

        window.history.pushState(window.history.state, '', PathRoute.path);
        window.dispatchEvent(new PopStateEvent('popstate'));
        await wait();

        expect(sync).not.toHaveBeenCalled();
      });
    });

    describe('navigation', () => {
      it('should subscribe to currententrychange events when the router is instantiated', async () => {
        expect.assertions(6);

        router = await getRouter({ routes, navigation, listen: 'navigation' });

        expect(router.options.listen).toBe('navigation');
        expect(addNavigationEventListener).toHaveBeenCalledTimes(1);
        expect(addNavigationEventListener).toHaveBeenCalledWith('currententrychange', expect.any(Function));

        expect(removeNavigationEventListener).not.toHaveBeenCalled();
        await router.destroy();

        expect(removeNavigationEventListener).toHaveBeenCalledTimes(1);
        expect(removeNavigationEventListener).toHaveBeenCalledWith('currententrychange', expect.any(Function));
      });

      it('should fallback to `history` when `navigation` is not supported', async () => {
        expect.assertions(7);

        router = await getRouter({ routes, listen: 'navigation', navigation: null });

        expect(router.options.listen).toBe('history');
        expect(addWindowEventListener).toHaveBeenCalledTimes(1);
        expect(addWindowEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));

        expect(addNavigationEventListener).not.toHaveBeenCalled();

        await router.destroy();

        expect(removeWindowEventListener).toHaveBeenCalledTimes(1);
        expect(removeWindowEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
        expect(addNavigationEventListener).not.toHaveBeenCalled();
      });

      it('should call navigation listeners when currententrychange is triggered', async () => {
        expect.assertions(6);

        router = await getRouter({ routes, navigation, listen: 'navigation' });

        expect(sync).not.toHaveBeenCalled();

        // currententrychange is ignored because the state is already synced
        navigation.dispatchEvent(new CustomEvent('currententrychange'));
        await wait();

        expect(sync).not.toHaveBeenCalled();
        expect(router.route).toBeUndefined();

        window.history.pushState(null, '', PathRoute.path);
        navigation.dispatchEvent(new CustomEvent('currententrychange'));
        await wait();

        expect(sync).toHaveBeenCalledTimes(1);
        expect(replace).toHaveBeenCalledWith({ path: PathRoute.path });
        expect(router.route.name).toBe(PathRoute.name);
      });

      it('should not call sync when currententrychange is triggered and the state is already synced', async () => {
        expect.assertions(4);

        router = await getRouter({ routes, navigation, listen: 'navigation' });

        await router.push(PathRoute);
        expect(sync).not.toHaveBeenCalled();
        expect(resolve).toHaveBeenCalledWith(PathRoute, router.options);

        expect(router.route.name).toBe(PathRoute.name);

        window.history.pushState(window.history.state, '', PathRoute.path);
        navigation.dispatchEvent(new CustomEvent('currententrychange'));
        await wait();

        expect(sync).not.toHaveBeenCalled();
      });
    });

    describe('sync', () => {
      it('should not update the state when a navigation is redirected', async () => {
        expect.assertions(8);

        router = await getRouter({ routes, navigation, listen: 'navigation', syncUpdate: false });

        const path = '/wildcard/something';
        window.history.pushState(null, '', path);
        navigation.dispatchEvent(new CustomEvent('currententrychange'));
        await wait();

        expect(sync).toHaveBeenCalledTimes(1);
        expect(resolve).toHaveBeenCalledTimes(2);
        expect(resolve).toHaveBeenCalledWith({ path });
        expect(resolve).toHaveBeenCalledWith({ name: PathRoute.name }, router.options);
        expect(replace).not.toHaveBeenCalled();
        expect(push).not.toHaveBeenCalled();

        expect(router.route.name).toBe(PathRoute.name);
        expect(window.location.pathname).toBe(path);
      });

      it('should push state to the history when a navigation is redirected', async () => {
        expect.assertions(7);

        router = await getRouter({ routes, navigation, listen: 'navigation', syncUpdate: 'replace' });

        const path = '/wildcard/something';
        window.history.pushState(null, '', path);
        navigation.dispatchEvent(new CustomEvent('currententrychange'));
        await wait();

        expect(sync).toHaveBeenCalledTimes(1);
        expect(resolve).toHaveBeenCalledTimes(2);
        expect(replace).toHaveBeenCalledTimes(1);
        expect(replace).toHaveBeenCalledWith({ path });
        expect(push).not.toHaveBeenCalled();

        expect(router.route.name).toBe(PathRoute.name);
        expect(window.location.pathname).toBe(PathRoute.path);
      });

      it('should replace state in the history when a navigation is redirected', async () => {
        expect.assertions(7);

        router = await getRouter({ routes, navigation, listen: 'navigation', syncUpdate: 'push' });

        const path = '/wildcard/something';
        window.history.pushState(null, '', path);
        navigation.dispatchEvent(new CustomEvent('currententrychange'));
        await wait();

        expect(sync).toHaveBeenCalledTimes(1);
        expect(resolve).toHaveBeenCalledTimes(2);
        expect(push).toHaveBeenCalledTimes(1);
        expect(push).toHaveBeenCalledWith({ path });
        expect(replace).not.toHaveBeenCalled();

        expect(router.route.name).toBe(PathRoute.name);
        expect(window.location.pathname).toBe(PathRoute.path);
      });
    });
  });

  describe('navigationEvent', () => {
    const log = vi.spyOn(Logger.logger, 'error').mockReturnValue(undefined);
    it('should instantiate a NavigationEvent with the to and from routes', () => {
      expect.assertions(10);
      const event = new NavigationEvent(PathRoute, HomeRoute);

      expect(event.to).toStrictEqual({ path: PathRoute.path, name: PathRoute.name, route: undefined });
      expect(event.from).toStrictEqual(HomeRoute);
      expect(event.uuid).toBeDefined();
      expect(event.status).toBe('active');
      expect(event.error).toBeUndefined();
      expect(event.active).toBeTruthy();
      expect(event.completed).toBeFalsy();
      expect(event.cancelled).toBeFalsy();
      expect(event.failed).toBeFalsy();
      expect(event.redirected).toBeFalsy();
    });

    describe('redirect', () => {
      it('should mark the event as redirected and event.redirected should be true', () => {
        expect.assertions(4);

        const event = new NavigationEvent(PathRoute, HomeRoute);
        event.redirect(OtherRoute);

        expect(event.active).toBeFalsy();
        expect(event.redirected).toBeTruthy();
        expect(event.error).toBeUndefined();
        expect(event.failed).toBeFalsy();
      });

      it('should log an error if the event is not active', () => {
        expect.assertions(3);

        const event = new NavigationEvent(PathRoute, HomeRoute);
        event.redirect(OtherRoute);
        expect(log).not.toHaveBeenCalled();

        event.redirect(OtherRoute);
        expect(log).toHaveBeenCalledTimes(1);
        expect(log).toHaveBeenCalledWith('Cannot redirect a navigation event that is not active', event);
      });
    });

    describe('complete', () => {
      it('should mark the event as completed and event.completed should be true', () => {
        expect.assertions(4);

        const event = new NavigationEvent(PathRoute, HomeRoute);
        event.complete();
        expect(event.active).toBeFalsy();
        expect(event.completed).toBeTruthy();
        expect(event.error).toBeUndefined();
        expect(event.failed).toBeFalsy();
      });

      it('should log an error if the event is not active', () => {
        expect.assertions(3);

        const event = new NavigationEvent(PathRoute, HomeRoute);
        event.complete();
        expect(log).not.toHaveBeenCalled();

        event.complete();
        expect(log).toHaveBeenCalledTimes(1);
        expect(log).toHaveBeenCalledWith('Cannot complete a navigation event that is not active', event);
      });
    });

    describe('cancel', () => {
      it('should mark the event as cancelled, event.error should be defined, event.cancelled should be true and should throw a cancellation error', () => {
        expect.assertions(5);

        const event = new NavigationEvent(PathRoute, HomeRoute);
        expect(() => event.cancel()).toThrow(expect.any(NavigationCancelledError));

        expect(event.active).toBeFalsy();
        expect(event.cancelled).toBeTruthy();
        expect(event.error).toBeDefined();
        expect(event.failed).toBeTruthy();
      });

      it('should log an error if the event is not active', () => {
        expect.assertions(4);

        const event = new NavigationEvent(PathRoute, HomeRoute);
        expect(() => event.cancel()).toThrow(expect.any(NavigationCancelledError));
        expect(log).not.toHaveBeenCalled();

        event.cancel();
        expect(log).toHaveBeenCalledTimes(1);
        expect(log).toHaveBeenCalledWith('Cannot cancel a navigation event that is not active', event);
      });
    });

    describe('fail', () => {
      it('should mark the event as failed, event.error should be defined, event.failed should be true and should throw a navigation aborted error', () => {
        expect.assertions(5);

        const event = new NavigationEvent(PathRoute, HomeRoute);
        expect(() => event.fail()).toThrow(expect.any(NavigationAbortedError));

        expect(event.active).toBeFalsy();
        expect(event.failed).toBeTruthy();
        expect(event.error).toBeDefined();
        expect(event.cancelled).toBeFalsy();
      });
      it('should log an error if the event is not active', () => {
        expect.assertions(4);

        const event = new NavigationEvent(PathRoute, HomeRoute);
        expect(() => event.fail()).toThrow(expect.any(NavigationAbortedError));
        expect(log).not.toHaveBeenCalled();

        event.fail();
        expect(log).toHaveBeenCalledTimes(1);
        expect(log).toHaveBeenCalledWith('Cannot fail a navigation event that is not active', event);
      });
    });

    describe('result', () => {
      const resolverSpy = vi.spyOn(Promise, 'withResolvers');
      const resolveSpy = vi.spyOn(Promise, 'resolve');
      const rejectSpy = vi.spyOn(Promise, 'reject');

      it('should return the result of the view event if the event is already completer or redirected', async () => {
        expect.assertions(4);

        const event = new NavigationEvent(PathRoute, HomeRoute);
        event.complete();

        await expect(event.result).resolves.toBe('completed');

        expect(resolverSpy).not.toHaveBeenCalled();
        expect(rejectSpy).not.toHaveBeenCalled();
        expect(resolveSpy).toHaveBeenCalledWith('completed');
      });

      it('should return a rejected promise if the event is failed', async () => {
        expect.assertions(4);

        const event = new NavigationEvent(PathRoute, HomeRoute);
        expect(() => event.fail()).toThrow(expect.any(NavigationAbortedError));
        await expect(event.result).rejects.toThrow('failed');

        expect(resolverSpy).not.toHaveBeenCalled();
        expect(rejectSpy).toHaveBeenCalledWith('failed');
      });

      it('should return a pending promise if the event is pending', async () => {
        expect.assertions(3);

        const event = new NavigationEvent(PathRoute, HomeRoute);

        const promise = event.result;

        expect(promise).toBeInstanceOf(Promise);
        event.complete();

        await expect(promise).resolves.toBe('completed');

        expect(resolverSpy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
