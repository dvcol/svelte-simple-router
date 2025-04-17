import type { NavigationFailureType } from '~/models/error.model.js';
import type { Route } from '~/models/route.model.js';
import type { ResolvedRouterLocationSnapshot, RouterLocation, RouterState, RouterStateLocation } from '~/models/router.model.js';

import { describe, expect, it } from 'vitest';

import { NavigationAbortedError } from '~/models/error.model.js';
import { cloneRoute, isRouteEqual } from '~/models/route.model.js';
import { isLocationEqual, RouterScrollConstant, RouterStateConstant } from '~/models/router.model.js';
import { isRouteNavigation, preventNavigation, resolveNewHref, routeToHistoryState } from '~/utils/navigation.utils.js';

describe('routeToHistoryState', () => {
  const resolved = {
    route: {
      name: 'user',
      path: '/path/user/:id',
      title: 'User Route',
      meta: { key: 'value' },
    },
    location: {
      name: 'user',
      path: '/path/user/1234',
      href: 'http://localhost:3000/base/path/user/1234?query=string',
      query: { query: 'string' },
      params: { id: '1234' },
    },
    origin: 'http://localhost:3000',
    wildcards: {},
  } satisfies ResolvedRouterLocationSnapshot;

  const expected: RouterState = {
    [RouterStateConstant]: {
      name: resolved.location.name,
      path: resolved.location.path,
      href: resolved.location.href.toString(),
      query: resolved.location.query,
      params: resolved.location.params,
    },
    [RouterScrollConstant]: { x: globalThis?.scrollX, y: globalThis?.scrollY },
  };

  it('should return a history state object and title', () => {
    expect.assertions(2);
    const { state, title } = routeToHistoryState(resolved);
    expect(state).toStrictEqual(expected);
    expect(title).toBe(resolved.route.title);
  });

  it('should return a history state object without title', () => {
    expect.assertions(2);
    const { state, title } = routeToHistoryState({ ...resolved, route: { ...resolved.route, title: undefined } });
    expect(state).toStrictEqual(expected);
    expect(title).toBeUndefined();
  });

  it('should return a history state object with meta', () => {
    expect.assertions(2);
    const { state, title } = routeToHistoryState(resolved, { metaAsState: true });
    expect(state).toMatchObject({
      ...expected,
      [RouterStateConstant]: { ...expected[RouterStateConstant], meta: JSON.parse(JSON.stringify(resolved.route.meta)) as RouterStateLocation },
    });
    expect(title).toBe(resolved.route.title);
  });

  it('should return a history state object and title with nameAsTitle', () => {
    expect.assertions(2);
    const { state, title } = routeToHistoryState({ ...resolved, route: { ...resolved.route, title: undefined } }, { nameAsTitle: true });
    expect(state).toStrictEqual(expected);
    expect(title).toBe(resolved.location.name);
  });

  it('should return a history state object and custom scroll position', () => {
    expect.assertions(2);
    const { state, title } = routeToHistoryState(resolved, { scrollState: { x: 0, y: 0 } });
    expect(state).toStrictEqual({ ...expected, [RouterScrollConstant]: { x: 0, y: 0 } });
    expect(title).toBe(resolved.route.title);
  });

  it('should return a history state object and seed state', () => {
    expect.assertions(2);
    const { state, title } = routeToHistoryState(resolved, { state: { existing: 'state' } });
    expect(state).toStrictEqual({ ...expected, existing: 'state' });
    expect(title).toBe(resolved.route.title);
  });

  it('should inject params into the title', () => {
    expect.assertions(3);

    const { state, title } = routeToHistoryState({
      ...resolved,
      location: { ...resolved.location, params: { notification: '(10)', suffix: 12 } },
      route: { ...resolved.route, title: ':notification:? User Route - (:suffix) :optional:?' },
    });
    expect(state).toStrictEqual({
      ...expected,
      [RouterStateConstant]: { ...expected[RouterStateConstant], params: { notification: '(10)', suffix: 12 } },
    });
    expect(title).toBe('(10) User Route - (12)');

    expect(
      routeToHistoryState({
        ...resolved,
        location: { ...resolved.location, params: { optional: 'My Path', suffix: 12 } },
        route: { ...resolved.route, title: ':notification:? User Route - (:suffix) :optional:?' },
      }).title,
    ).toBe('User Route - (12) My Path');
  });
});

describe('resolveNewHref', () => {
  describe('path mode', () => {
    it('should resolve a new href in path mode', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path');
      expect(href.toString()).toBe('http://localhost:3000/new/path');
      expect(search.toString()).toBe('');
    });

    it('should resolve a new href in path mode with a query', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path', { query: { query: 'string' } });
      expect(href.toString()).toBe('http://localhost:3000/new/path?query=string');
      expect(search.toString()).toBe('query=string');
    });

    it('should resolve a new href in path mode with a query and target query', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path?number=2&query', {
        query: { query: 'string' },
        current: 'http://localhost:3000/old/path?old=value',
      });
      expect(href.toString()).toBe('http://localhost:3000/new/path?old=value&query=string&number=2');
      expect(search.toString()).toBe('old=value&query=string&number=2');
    });

    it('should resolve a new href in path mode with a base', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path', { base: '/base', query: { query: 'string' }, current: 'http://localhost:3000/base' });
      expect(href.toString()).toBe('http://localhost:3000/base/new/path?query=string');
      expect(search.toString()).toBe('query=string');
    });

    it('should resolve a new href in path mode with a base when not on the base already', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path', { base: '/base', query: { query: 'string' }, current: 'http://localhost:3000/other' });
      expect(href.toString()).toBe('http://localhost:3000/base/new/path?query=string');
      expect(search.toString()).toBe('query=string');
    });

    it('should keep the old query when replacing new href in path mode', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path', { query: { query: 'string' }, current: 'http://localhost:3000/old/path?old=value' });
      expect(href.toString()).toBe('http://localhost:3000/new/path?old=value&query=string');
      expect(search.toString()).toBe('old=value&query=string');
    });

    it('should strip the query from the new href in path mode', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path', {
        query: { query: 'string' },
        stripQuery: true,
        current: 'http://localhost:3000/old/path?old=value',
      });
      expect(href.toString()).toBe('http://localhost:3000/new/path?query=string');
      expect(search.toString()).toBe('query=string');
    });

    it('should keep the hash from the new href in path mode', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path', { current: 'http://localhost:3000/old/path#old' });
      expect(href.toString()).toBe('http://localhost:3000/new/path#old');
      expect(search.toString()).toBe('');
    });

    it('should strip the hash from the new href in path mode', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path', { stripHash: true, current: 'http://localhost:3000/old/path#old' });
      expect(href.toString()).toBe('http://localhost:3000/new/path');
      expect(search.toString()).toBe('');
    });

    it('should keep hash and query from the new href in path mode', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path', { current: 'http://localhost:3000/old/path?old=value#old' });
      expect(href.toString()).toBe('http://localhost:3000/new/path?old=value#old');
      expect(search.toString()).toBe('old=value');
    });
  });

  describe('hash mode', () => {
    it('should resolve a new href in hash mode', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path', { hash: true });
      expect(href.toString()).toBe('http://localhost:3000/#/new/path');
      expect(search.toString()).toBe('');
    });

    it('should resolve a new href in hash mode with a query', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path', { hash: true, query: { query: 'string' } });
      expect(href.toString()).toBe('http://localhost:3000/#/new/path?query=string');
      expect(search.toString()).toBe('query=string');
    });

    it('should resolve a new href in path mode with a query and target query', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path?number=2&query', { hash: true, query: { query: 'string' } });
      expect(href.toString()).toBe('http://localhost:3000/#/new/path?query=string&number=2');
      expect(search.toString()).toBe('query=string&number=2');
    });

    it('should resolve a new href in hash mode with a base (base is ignored)', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path', {
        base: '/base',
        hash: true,
        query: { query: 'string' },
        current: 'http://localhost:3000/base',
      });
      expect(href.toString()).toBe('http://localhost:3000/base/#/new/path?query=string');
      expect(search.toString()).toBe('query=string');
    });

    it('should resolve a new href in hash mode with a base when not on the base already', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path', {
        base: '/base',
        hash: true,
        query: { query: 'string' },
        current: 'http://localhost:3000/other',
      });
      expect(href.toString()).toBe('http://localhost:3000/base/#/new/path?query=string');
      expect(search.toString()).toBe('query=string');
    });

    it('should resolve a new href in hash mode with any pathname', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path', {
        hash: true,
        query: { query: 'string' },
        current: 'http://localhost:3000/any/path/name',
      });
      expect(href.toString()).toBe('http://localhost:3000/any/path/name/#/new/path?query=string');
      expect(search.toString()).toBe('query=string');
    });

    it('should enforce trailing slashes in pathname when no base is provided', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/', { hash: true });
      expect(href.toString()).toBe('http://localhost:3000/#/');
      expect(search.toString()).toBe('');
    });

    it('should keep the old query when replacing new href in hash mode', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path', {
        hash: true,
        query: { query: 'string' },
        current: 'http://localhost:3000/#/old/path?old=value',
      });
      expect(href.toString()).toBe('http://localhost:3000/#/new/path?old=value&query=string');
      expect(search.toString()).toBe('old=value&query=string');
    });

    it('should strip the query from the new href in hash mode', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path', {
        hash: true,
        query: { query: 'string' },
        stripQuery: true,
        current: 'http://localhost:3000/#/old/path?old=value',
      });
      expect(href.toString()).toBe('http://localhost:3000/#/new/path?query=string');
      expect(search.toString()).toBe('query=string');
    });

    it('should keep the trailing hash from the new href in hash mode', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path', {
        hash: true,
        current: 'http://localhost:3000/#/old/path#old',
      });
      expect(href.toString()).toBe('http://localhost:3000/#/new/path#old');
      expect(search.toString()).toBe('');
    });

    it('should strip the trailing hash from the new href in hash mode', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path', {
        hash: true,
        stripTrailingHash: true,
        current: 'http://localhost:3000/#/old/path#old',
      });
      expect(href.toString()).toBe('http://localhost:3000/#/new/path');
      expect(search.toString()).toBe('');
    });

    it('should add a trailing slash to the pathname when no query is present and no pathname exists', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path', { hash: true, current: 'http://localhost:3000' });
      expect(href.toString()).toBe('http://localhost:3000/#/new/path');
      expect(search.toString()).toBe('');
    });

    it('should add a trailing slash to the pathname when no query is present and a hash is present', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path', { hash: true, current: 'http://localhost:3000#any-hash' });
      expect(href.toString()).toBe('http://localhost:3000/#/new/path');
      expect(search.toString()).toBe('');
    });

    it('should add a trailing slash to the pathname when no query is present and pathname does not end with a slash', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path', { hash: true, current: 'http://localhost:3000/old-path' });
      expect(href.toString()).toBe('http://localhost:3000/old-path/#/new/path');
      expect(search.toString()).toBe('');
    });

    it('should not add a trailing slash to the pathname when no query is present and pathname ends with a slash', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path', { hash: true, current: 'http://localhost:3000/old-path/' });
      expect(href.toString()).toBe('http://localhost:3000/old-path/#/new/path');
      expect(search.toString()).toBe('');
    });

    it('should add a trailing slash to the search when there is a query string and pathname', () => {
      expect.assertions(2);
      const { href, search } = resolveNewHref('/new/path', { hash: true, current: 'http://localhost:3000/old-path?query=string' });
      expect(href.toString()).toBe('http://localhost:3000/old-path?query=string/#/new/path');
      expect(search.toString()).toBe('');
    });
  });
});

describe('guards', () => {
  describe('isRouteNavigation', () => {
    it('should return true if the event is a name route navigation event', () => {
      expect.assertions(1);
      expect(isRouteNavigation({ name: 'user' })).toBeTruthy();
    });

    it('should return true if the event is a path route navigation event', () => {
      expect.assertions(1);
      expect(isRouteNavigation({ path: '/path/user/1234' })).toBeTruthy();
    });

    it('should return false if the event is falsy', () => {
      expect.assertions(3);
      expect(isRouteNavigation(null)).toBeFalsy();
      expect(isRouteNavigation(undefined)).toBeFalsy();
      expect(isRouteNavigation(false)).toBeFalsy();
    });

    it('should return false if the event is not an object', () => {
      expect.assertions(1);
      expect(isRouteNavigation('user')).toBeFalsy();
    });

    it('should return false if the event is missing a name or path property', () => {
      expect.assertions(1);
      expect(isRouteNavigation({})).toBeFalsy();
    });
  });

  describe('preventNavigation', () => {
    const failure: NavigationFailureType = {
      from: { name: 'home', path: '/home' },
      to: { name: 'user', path: '/user/1234' },
    };
    it('should throw an error if the guard returns an error', () => {
      expect.assertions(1);
      const error = new Error('error message');
      expect(() => preventNavigation(error, failure)).toThrow(new NavigationAbortedError(failure, { error }));
    });

    it('should return true if the guard returns false', () => {
      expect.assertions(1);
      expect(() => preventNavigation(false, failure)).toThrow(new NavigationAbortedError(failure));
    });

    it('should return true if the guard returns string', () => {
      expect.assertions(1);
      expect(() => preventNavigation('string error', failure)).toThrow(new NavigationAbortedError(failure, { message: 'string error' }));
    });

    it('should return the navigation event if the guard returns a navigation event', () => {
      expect.assertions(1);
      const event = { name: 'user' };
      expect(preventNavigation(event, failure)).toBe(event);
    });

    it('should return false if the guard returns true', () => {
      expect.assertions(1);
      expect(preventNavigation(true, failure)).toBeFalsy();
    });

    it('should return false if the guard returns undefined', () => {
      expect.assertions(1);
      expect(preventNavigation(undefined, failure)).toBeFalsy();
    });

    it('should return false if the guard returns null', () => {
      expect.assertions(1);
      expect(preventNavigation(null, failure)).toBeFalsy();
    });

    it('should return false if the guard returns a falsy value', () => {
      expect.assertions(1);
      expect(preventNavigation(0, failure)).toBeFalsy();
    });
  });
});

describe('route', () => {
  const route: Route = {
    name: 'user',
    path: '/path/user/:id',
    title: 'User Route',
    meta: { key: 'value' },
    query: { query: 'string' },
    params: { id: '1234' },
    component: async () => import('~/components/RouteComponent.svelte'),
    error: async () => import('~/components/RouteTransition.svelte'),
  };
  describe('cloneRoute', () => {
    it('should clone a route', () => {
      expect.assertions(2);
      const clone = cloneRoute(route);
      expect(clone !== route).toBeTruthy();
      expect(clone).toMatchObject(route);
    });

    it('should not modify the original route when modifying the clone', () => {
      expect.assertions(3);
      const clone = cloneRoute(route);
      clone.name = 'new';
      expect(clone.name).not.toBe(route.name);
      expect(clone.name).toBe('new');
      expect(route.name).toBe('user');
    });
  });

  describe('isRouteEqual', () => {
    it('should return true if the routes are the same', () => {
      expect.assertions(1);
      expect(isRouteEqual(route, route)).toBeTruthy();
    });

    it('should return true if the routes are the clones', () => {
      expect.assertions(2);
      const clone = cloneRoute(route);
      expect(isRouteEqual(route, clone)).toBeTruthy();
      expect(isRouteEqual(clone, route)).toBeTruthy();
    });

    it('should return true if the routes identical', () => {
      expect.assertions(2);
      const other: Route = {
        name: 'user',
        path: '/path/user/:id',
        title: 'User Route',
        meta: { key: 'value' },
        query: { query: 'string' },
        params: { id: '1234' },
        component: route.component,
        error: route.error,
      };
      expect(isRouteEqual(route, other)).toBeTruthy();
      expect(isRouteEqual(other, route)).toBeTruthy();
    });

    it('should return true if one route is a proxy of the other', () => {
      expect.assertions(2);
      const proxy = new Proxy(route, {});
      expect(isRouteEqual(route, proxy)).toBeTruthy();
      expect(isRouteEqual(proxy, route)).toBeTruthy();
    });

    it('should return false if one route is undefined', () => {
      expect.assertions(2);
      expect(isRouteEqual(route, undefined)).toBeFalsy();
      expect(isRouteEqual(undefined, route)).toBeFalsy();
    });

    it('should return false if the routes components are different', () => {
      expect.assertions(2);
      const other: Route = {
        ...cloneRoute(route),
        component: async () => import('~/components/RouterView.svelte'),
      };

      expect(isRouteEqual(route, other)).toBeFalsy();
      expect(isRouteEqual(other, route)).toBeFalsy();
    });

    it('should return false if the routes loading properties are different', () => {
      expect.assertions(2);
      const other: Route = {
        ...cloneRoute(route),
        loading: async () => import('~/components/RouterContext.svelte'),
      };

      expect(isRouteEqual(route, other)).toBeFalsy();
      expect(isRouteEqual(other, route)).toBeFalsy();
    });

    it('should return false if the routes meta properties are different', () => {
      expect.assertions(2);
      const other: Route = {
        ...cloneRoute(route),
        meta: { key: 'other' },
      };

      expect(isRouteEqual(route, other)).toBeFalsy();
      expect(isRouteEqual(other, route)).toBeFalsy();
    });
  });

  describe('isLocationEqual', () => {
    const location: RouterLocation = {
      origin: 'http://localhost:3000',
      base: '/base',
      name: 'user',
      path: '/path/user/1234',
      href: new URL('http://localhost:3000/base/path/user/1234/segment/end?query=string'),
      query: { query: 'string' },
      params: { id: '1234' },
      wildcards: { 2: 'segment/end' },
    };

    it('should return true if the locations are the same', () => {
      expect.assertions(1);
      expect(isLocationEqual(location, location)).toBeTruthy();
    });

    it('should return true if the locations are identical', () => {
      expect.assertions(2);
      const other: RouterLocation = {
        origin: 'http://localhost:3000',
        base: '/base',
        name: 'user',
        path: '/path/user/1234',
        href: new URL('http://localhost:3000/base/path/user/1234/segment/end?query=string'),
        query: { query: 'string' },
        params: { id: '1234' },
        wildcards: { 2: 'segment/end' },
      };

      expect(isLocationEqual(location, other)).toBeTruthy();
      expect(isLocationEqual(other, location)).toBeTruthy();
    });

    it('should return true if one location is a proxy of the other', () => {
      expect.assertions(2);
      const proxy = new Proxy(location, {});
      expect(isLocationEqual(location, proxy)).toBeTruthy();
      expect(isLocationEqual(proxy, location)).toBeTruthy();
    });

    it('should return false if one location is undefined', () => {
      expect.assertions(2);
      expect(isLocationEqual(location, undefined)).toBeFalsy();
      expect(isLocationEqual(undefined, location)).toBeFalsy();
    });

    it('should return false if the locations href properties are different', () => {
      expect.assertions(2);
      const other: RouterLocation = {
        ...location,
        href: new URL('http://localhost:3000/base/path/user/1234/other/end?query=other'),
      };

      expect(isLocationEqual(location, other)).toBeFalsy();
      expect(isLocationEqual(other, location)).toBeFalsy();
    });

    it('should return false if the locations query properties are different', () => {
      expect.assertions(2);
      const other: RouterLocation = {
        ...location,
        query: { query: 'other' },
      };

      expect(isLocationEqual(location, other)).toBeFalsy();
      expect(isLocationEqual(other, location)).toBeFalsy();
    });

    it('should return false if the locations params properties are different', () => {
      expect.assertions(2);
      const other: RouterLocation = {
        ...location,
        params: { id: 'other' },
      };

      expect(isLocationEqual(location, other)).toBeFalsy();
      expect(isLocationEqual(other, location)).toBeFalsy();
    });

    it('should return false if the locations state properties are different', () => {
      expect.assertions(2);
      const other: RouterLocation = {
        ...location,
        state: { key: 'value' },
      };

      expect(isLocationEqual(location, other)).toBeFalsy();
      expect(isLocationEqual(other, location)).toBeFalsy();
    });
  });
});
