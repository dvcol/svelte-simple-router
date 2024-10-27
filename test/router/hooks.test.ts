import { render } from '@testing-library/svelte';
import * as SvelteModule from 'svelte';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import HooksComponent from '../components/stub/HooksComponent.test.svelte';

import type { MockInstance } from 'vitest';

import { MissingRouterContextError, MissingViewContextError } from '~/models/error.model.js';
import * as ContextModule from '~/router/context.svelte.js';
import { hasRouter, hasView, useNavigate, useRoute, useRouter, useView } from '~/router/hooks.svelte.js';
import { Router } from '~/router/router.svelte.js';
import { View } from '~/router/view.svelte.js';

describe('hooks', () => {
  let router: Router;
  let view: View;

  let spyGetRouter: MockInstance<typeof ContextModule.getRouter>;
  let spyGetView: MockInstance<typeof ContextModule.getView>;
  let spyHasContext: MockInstance<typeof SvelteModule.hasContext>;

  const callback = () => {};

  let routerSpy: {
    resolve: MockInstance<Router['resolve']>;
    push: MockInstance<Router['push']>;
    replace: MockInstance<Router['replace']>;
    back: MockInstance<Router['back']>;
    forward: MockInstance<Router['forward']>;
    go: MockInstance<Router['go']>;
    beforeEach: MockInstance<Router['beforeEach']>;
    onStart: MockInstance<Router['onStart']>;
    onEnd: MockInstance<Router['onEnd']>;
    onError: MockInstance<Router['onError']>;
  };

  let viewSpy: {
    onChange: MockInstance<View['onChange']>;
    onLoaded: MockInstance<View['onLoaded']>;
    onLoading: MockInstance<View['onLoading']>;
    onError: MockInstance<View['onError']>;
  };

  const initRouteAndView = () => {
    router = new Router();
    spyGetRouter = vi.spyOn(ContextModule, 'getRouter').mockReturnValue(router);

    routerSpy = {
      resolve: vi.spyOn(router, 'resolve').mockReturnValue(vi.fn),
      push: vi.spyOn(router, 'push').mockReturnValue(vi.fn),
      replace: vi.spyOn(router, 'replace').mockReturnValue(vi.fn),
      back: vi.spyOn(router, 'back').mockReturnValue(vi.fn),
      forward: vi.spyOn(router, 'forward').mockReturnValue(vi.fn),
      go: vi.spyOn(router, 'go').mockReturnValue(vi.fn),
      beforeEach: vi.spyOn(router, 'beforeEach').mockReturnValue(vi.fn),
      onStart: vi.spyOn(router, 'onStart').mockReturnValue(vi.fn),
      onEnd: vi.spyOn(router, 'onEnd').mockReturnValue(vi.fn),
      onError: vi.spyOn(router, 'onError').mockReturnValue(vi.fn),
    };

    view = new View(router.id);
    spyGetView = vi.spyOn(ContextModule, 'getView').mockReturnValue(view);

    viewSpy = {
      onChange: vi.spyOn(view, 'onChange').mockReturnValue(vi.fn),
      onLoaded: vi.spyOn(view, 'onLoaded').mockReturnValue(vi.fn),
      onLoading: vi.spyOn(view, 'onLoading').mockReturnValue(vi.fn),
      onError: vi.spyOn(view, 'onError').mockReturnValue(vi.fn),
    };

    spyHasContext = vi.spyOn(SvelteModule, 'hasContext').mockReturnValue(true);
  };

  beforeEach(() => initRouteAndView());

  describe('useRouter', () => {
    it('should return the router', () => {
      expect.assertions(2);

      expect(hasRouter()).toBeTruthy();
      expect(useRouter()).toBe(router);
    });

    it('should throw an error when no router context is available', () => {
      expect.assertions(2);

      spyHasContext.mockReturnValueOnce(false);
      expect(hasRouter()).toBeFalsy();
      spyGetRouter.mockReturnValueOnce(null);
      expect(() => useRouter()).toThrow(MissingRouterContextError);
    });
  });

  describe('useView', () => {
    it('should return the view', () => {
      expect.assertions(2);

      expect(hasView()).toBeTruthy();
      expect(useView()).toBe(view);
    });

    it('should throw an error when no view context is available', () => {
      expect.assertions(2);

      spyHasContext.mockReturnValueOnce(false);
      expect(hasView()).toBeFalsy();
      spyGetView.mockReturnValueOnce(null);
      expect(() => useView()).toThrow(MissingViewContextError);
    });
  });

  describe('useRoute', () => {
    it('should return the route information', () => {
      expect.assertions(3);

      const { route, location, routing } = useRoute();

      expect(route).toBe(router.route);
      expect(location).toBe(router.location);
      expect(routing).toBe(router.routing);
    });

    it('should throw an error when no router context is available', () => {
      expect.assertions(1);
      spyGetRouter.mockReturnValueOnce(null);

      expect(() => useRoute()).toThrow(MissingRouterContextError);
    });
  });

  describe('useNavigate', () => {
    const route = { name: 'home', path: '/' };

    it('should return the navigate functions', () => {
      expect.assertions(10);

      const { resolve, push, replace, back, forward, go } = useNavigate();

      resolve(route);
      expect(routerSpy.resolve).toHaveBeenCalledTimes(1);
      expect(routerSpy.resolve).toHaveBeenCalledWith(route);

      push(route);
      expect(routerSpy.push).toHaveBeenCalledTimes(1);
      expect(routerSpy.push).toHaveBeenCalledWith(route);

      replace(route);
      expect(routerSpy.replace).toHaveBeenCalledTimes(1);
      expect(routerSpy.replace).toHaveBeenCalledWith(route);

      back();
      expect(routerSpy.back).toHaveBeenCalledTimes(1);

      forward();
      expect(routerSpy.forward).toHaveBeenCalledTimes(1);

      go(1);
      expect(routerSpy.go).toHaveBeenCalledTimes(1);
      expect(routerSpy.go).toHaveBeenCalledWith(1);
    });

    it('should throw an error when no router context is available', () => {
      expect.assertions(1);
      spyGetRouter.mockReturnValueOnce(null);

      expect(() => useNavigate()).toThrow(MissingRouterContextError);
    });
  });

  describe('listeners', () => {
    describe.each<[string, keyof typeof routerSpy]>([
      ['beforeEach', 'beforeEach'],
      ['onStart', 'onStart'],
      ['onEnd', 'onEnd'],
      ['onRouterError', 'onError'],
    ])('%s', (name, method) => {
      it(`should add a ${name} listener to the router`, () => {
        expect.assertions(2);

        render(HooksComponent, { name, callback });

        expect(routerSpy[method]).toHaveBeenCalledTimes(1);
        expect(routerSpy[method]).toHaveBeenCalledWith(callback);
      });

      it(`should throw an error when calling '${name}' and no router context is available`, () => {
        expect.assertions(1);
        spyGetRouter.mockReturnValueOnce(null);

        expect(() => render(HooksComponent, { name, callback })).toThrow(MissingRouterContextError);
      });
    });

    describe.each<[string, keyof typeof viewSpy]>([
      ['onChange', 'onChange'],
      ['onLoaded', 'onLoaded'],
      ['onLoading', 'onLoading'],
      ['onViewError', 'onError'],
    ])('%s', (name, method) => {
      it(`should add a '${name}' listener to the view`, () => {
        expect.assertions(2);

        render(HooksComponent, { name, callback });

        expect(viewSpy[method]).toHaveBeenCalledTimes(1);
        expect(viewSpy[method]).toHaveBeenCalledWith(callback);
      });

      it(`should throw an error when calling '${name}' and no view context is available`, () => {
        expect.assertions(1);
        spyGetView.mockReturnValueOnce(null);

        expect(() => render(HooksComponent, { name, callback })).toThrow(MissingViewContextError);
      });
    });

    describe('onError', () => {
      it('should add an onError listener to view and router', () => {
        expect.assertions(4);

        render(HooksComponent, { name: 'onError', callback });

        expect(router.onError).toHaveBeenCalledTimes(1);
        expect(router.onError).toHaveBeenCalledWith(callback);
        expect(view.onError).toHaveBeenCalledTimes(1);
        expect(view.onError).toHaveBeenCalledWith(callback);
      });

      it('should throw an error when no view context is available', () => {
        expect.assertions(1);
        spyGetView.mockReturnValueOnce(null);

        expect(() => render(HooksComponent, { name: 'onError', callback })).toThrow(MissingViewContextError);
      });

      it('should throw an error when no router context is available', () => {
        expect.assertions(1);
        spyGetRouter.mockReturnValueOnce(null);

        expect(() => render(HooksComponent, { name: 'onError', callback })).toThrow(MissingRouterContextError);
      });
    });
  });
});
