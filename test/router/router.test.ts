import { wait } from '@dvcol/common-utils/common/promise';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ParsingRelativePathError } from '@dvcol/common-utils/common/error';

import type { NavigationAbortedError, NavigationNotFoundError } from '~/models/error.model.js';

import type { Route, RouteParams, RouteQuery } from '~/models/route.model.js';

import { ErrorTypes } from '~/models/error.model.js';

import { NavigationEvent, RouterScrollConstant, RouterStateConstant } from '~/models/router.model.js';

import { Router } from '~/router/router.svelte.js';

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
  ];

  let router: Router;

  afterEach(() => {
    router?.destroy();
    window.location.hash = '';
    window.history.replaceState(null, '', '/');
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a new router with the provided routes', () => {
      expect.assertions(routes.length * 4);
      router = new Router({ routes });
      routes.forEach(route => {
        expect(router.routes.filter((r: Route) => r.name === route.name && r.path === route.path)).toHaveLength(1);
        expect(router.hasRoute(route)).toBeTruthy();
        expect(router.hasRouteName(route.name)).toBeTruthy();
        expect(router.hasRoutePath(route.path)).toBeTruthy();
      });
    });

    it('should create a new router with the default options', async () => {
      expect.assertions(10);
      router = new Router({ routes });
      // Flush the microtask queue to ensure the router is initialized
      await wait();
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
      router = new Router({
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
      // Flush the microtask queue to ensure the router is initialized
      await wait();
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
      router = new Router({ routes });
      await wait();
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
      router = new Router({ routes });
      await wait();
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
      const beforeEachFn = vi.fn();

      it('should instantiate a new router with a beforeEach navigation guard', async () => {
        expect.assertions(2);
        router = new Router({
          routes,
          beforeEach: beforeEachFn,
        });
        await wait();

        await router.push(PathRoute);

        expect(beforeEachFn).toHaveBeenCalledTimes(1);
        expect(beforeEachFn).toHaveBeenCalledWith(expect.any(NavigationEvent));
      });

      it('should add a navigation guard to be called before each navigation', async () => {
        expect.assertions(2);

        router = new Router({ routes });
        await wait();

        router.beforeEach(beforeEachFn);

        await router.push(PathRoute);

        expect(beforeEachFn).toHaveBeenCalledTimes(1);
        expect(beforeEachFn).toHaveBeenCalledWith(expect.any(NavigationEvent));
      });

      it('should remove a navigation guard when the returned function is called', async () => {
        expect.assertions(1);

        router = new Router({ routes });
        await wait();

        const remove = router.beforeEach(beforeEachFn);
        remove();

        await router.push(PathRoute);

        expect(beforeEachFn).not.toHaveBeenCalled();
      });
    });

    describe('onStart', () => {
      const onStartFn = vi.fn();

      it('should instantiate a new router with an onStart listener', async () => {
        expect.assertions(2);
        router = new Router({
          routes,
          onStart: onStartFn,
        });
        await wait();

        await router.push(PathRoute);

        expect(onStartFn).toHaveBeenCalledTimes(1);
        expect(onStartFn).toHaveBeenCalledWith(expect.any(NavigationEvent));
      });

      it('should add a listener to be called when a navigation starts', async () => {
        expect.assertions(2);

        router = new Router({ routes });
        await wait();

        router.onStart(onStartFn);

        await router.push(PathRoute);

        expect(onStartFn).toHaveBeenCalledTimes(1);
        expect(onStartFn).toHaveBeenCalledWith(expect.any(NavigationEvent));
      });

      it('should remove a listener when the returned function is called', async () => {
        expect.assertions(1);

        router = new Router({ routes });
        await wait();

        const remove = router.onStart(onStartFn);
        remove();

        await router.push(PathRoute);

        expect(onStartFn).not.toHaveBeenCalled();
      });
    });

    describe('onEnd', () => {
      const onEndFn = vi.fn();

      it('should instantiate a new router with an onEnd listener', async () => {
        expect.assertions(2);
        router = new Router({
          routes,
          onEnd: onEndFn,
        });
        await wait();

        await router.push(PathRoute);

        expect(onEndFn).toHaveBeenCalledTimes(1);
        expect(onEndFn).toHaveBeenCalledWith(expect.any(NavigationEvent), router.snapshot);
      });

      it('should add a listener to be called when a navigation ends', async () => {
        expect.assertions(2);

        router = new Router({ routes });
        await wait();

        router.onEnd(onEndFn);

        await router.push(PathRoute);

        expect(onEndFn).toHaveBeenCalledTimes(1);
        expect(onEndFn).toHaveBeenCalledWith(expect.any(NavigationEvent), router.snapshot);
      });

      it('should remove a listener when the returned function is called', async () => {
        expect.assertions(1);

        router = new Router({ routes });
        await wait();

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
        router = new Router({
          routes,
          onError: onErrorFn,
          beforeEach: beforeEachErrorFn,
        });
        await wait();

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

        router = new Router({
          routes,
          beforeEach: beforeEachErrorFn,
        });
        await wait();

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

        router = new Router({
          routes,
          beforeEach: beforeEachErrorFn,
        });
        await wait();

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
    };

    describe('path mode', () => {
      beforeEach(async () => {
        router = new Router({ routes, listen: false, hash: false });
        await wait();
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
        router = new Router({ routes, listen: false, hash: true });
        await wait();
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
      router = new Router({ routes: _routes, listen: false });
      await wait();
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

    describe('go', () => {
      it.todo('should navigate forward to a location by its position in the history and update the route and location');
      it.todo('should navigate backward to a location by its position in the history and update the route and location');
    });

    describe('back', () => {
      it.todo('should navigate backward in the history and update the route and location');
    });

    describe('forward', () => {
      it.todo('should navigate forward in the history and update the route and location');
    });
  });

  describe('listeners', () => {
    describe('history', () => {
      router = new Router({ routes, listen: 'history' });
      it.todo('should call navigation listeners when popstate is triggered');
      it.todo('should call #navigate when popstate is triggered and a route is resolved from the hash in hash mode');
      it.todo('should call #navigate when popstate is triggered and a route is resolved from the path in path mode');
      it.todo('should call not call #navigate when popstate is triggered and a route is not resolved');
    });

    describe('navigation', () => {
      router = new Router({ routes, listen: 'navigation' });
      it.todo('should fallback to `history` when `navigation` is not supported');
      it.todo('should call navigation listeners when navigate is triggered and window.navigation is defined');
      it.todo('should call #navigate when navigate is triggered and a route is resolved from the hash in hash mode');
      it.todo('should call #navigate when navigate is triggered and a route is resolved from the path in path mode');
      it.todo('should call not call #navigate when navigate is triggered and a route is not resolved');
    });
  });
});
