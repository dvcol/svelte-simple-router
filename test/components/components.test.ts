import { wait } from '@dvcol/common-utils/common/promise';
import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import RouterContext from './RouterContext.test.svelte';
import RouterView from './RouterView.test.svelte';
import RouterViewNested from './RouterViewNested.test.svelte';

import { routes } from './stub/routes.js';

import { Router } from '~/router/router.svelte.js';

describe('routerView', () => {
  let router: Router;

  afterEach(async () => {
    cleanup();
    window.history.pushState({}, '', '/');
  });

  beforeEach(async () => {
    router = new Router({ routes, hash: true, listen: false });
    await wait();
    vi.clearAllMocks();
  });

  describe('routing', () => {
    const common = (component: Parameters<typeof render>[0]) => {
      it('should render no component', () => {
        expect.assertions(1);
        render(component, { router });

        expect(() => screen.getByTestId('hello-component')).toThrow('Unable to find an element by: [data-testid="hello-component"]');
      });

      it('should render a hello component', async () => {
        expect.assertions(5);

        render(component, { router });
        await router.push({ path: '/hello' });

        const hello = screen.getByTestId('hello-component');
        expect(hello).toBeDefined();

        const title = hello.querySelector('h2[data-testid="title"]');
        expect(title).toBeDefined();
        expect(title?.textContent).toBe('Hello');

        const meta = hello.querySelector('h2[data-testid="meta"]');
        expect(meta).toBeDefined();
        expect(meta?.textContent).toBe('Hello');
      });

      it('should render a async component', async () => {
        expect.assertions(5);

        render(component, { router });
        await router.push({ path: '/goodbye' });

        // wait for the component to load
        await wait(100);

        const goodbye = screen.getByTestId('goodbye-component');
        expect(goodbye).toBeDefined();

        const title = goodbye.querySelector('h2[data-testid="title"]');
        expect(title).toBeDefined();
        expect(title?.textContent).toBe('Goodbye');

        const meta = goodbye.querySelector('h2[data-testid="meta"]');
        expect(meta).toBeDefined();
        expect(meta?.textContent).toBe('Goodbye');
      });

      it('should render a loading component', async () => {
        expect.assertions(2);

        render(component, { router });
        await router.push({ path: '/loading' });

        const loading = screen.getByTestId('loading-component');
        expect(loading).toBeDefined();

        await wait(500);

        const hello = screen.getByTestId('hello-component');
        expect(hello).toBeDefined();
      });

      it('should render a default loading component', async () => {
        expect.assertions(2);

        render(component, { router });
        await router.push({ path: '/default-loading' });

        const loading = screen.getByTestId('default-loading');
        expect(loading).toBeDefined();

        await wait(500);

        const hello = screen.getByTestId('hello-component');
        expect(hello).toBeDefined();
      });

      it('should render an error component', async () => {
        expect.assertions(3);

        render(component, { router });
        await router.push({ path: '/error' });

        const errorComponent = screen.getByTestId('error-component');
        expect(errorComponent).toBeDefined();

        const message = errorComponent.querySelector('p[data-testid="error-message"]');
        expect(message).toBeDefined();
        expect(message?.textContent).toBe('Loading error');
      });

      it('should render a default error component', async () => {
        expect.assertions(3);

        render(component, { router });
        await router.push({ path: '/default-error' });

        const errorComponent = screen.getByTestId('default-error');
        expect(errorComponent).toBeDefined();

        const message = errorComponent.querySelector('p[data-testid="error-message"]');
        expect(message).toBeDefined();
        expect(message?.textContent).toBe('Default Error');
      });

      it('should render a routing snippet', async () => {
        expect.assertions(5);

        await router.push({ path: '/goodbye' });
        render(component, { router });
        const routing$ = router.push({ name: 'routing' });
        await wait(100);

        const routing = screen.getByTestId('default-routing');
        expect(routing).toBeDefined();
        const from = routing.querySelector('span[data-testid="routing-from"]');
        console.info('from', routing.innerHTML);
        expect(from?.textContent).toBe('goodbye');
        const to = routing.querySelector('span[data-testid="routing-to"]');
        expect(to?.textContent).toBe('routing');

        await routing$;

        const loading = screen.getByTestId('default-loading');
        expect(loading).toBeDefined();

        await wait(200);

        const hello = screen.getByTestId('hello-component');
        expect(hello).toBeDefined();
      });
    };

    describe('single view', () => common(RouterView));

    const nested = (component: Parameters<typeof render>[0]) => {
      common(component);

      it('should render nested components', async () => {
        expect.assertions(6);

        render(RouterContext, { router });
        await router.push({ path: '/nested' });

        // wait for the component to load
        await wait(100);

        const hello = screen.getByTestId('hello-component');
        expect(hello).toBeDefined();

        const helloTitle = hello.querySelector('h2[data-testid="title"]');
        expect(helloTitle).toBeDefined();
        expect(helloTitle?.textContent).toBe('Nested Hello');

        const goodbye = screen.getByTestId('goodbye-component');
        expect(goodbye).toBeDefined();

        const goodbyeTitle = goodbye.querySelector('h2[data-testid="title"]');
        expect(goodbyeTitle).toBeDefined();
        expect(goodbyeTitle?.textContent).toBe('Nested Goodbye');
      });
    };

    describe('nested views', () => nested(RouterViewNested));

    describe('context with nested views', () => nested(RouterContext));
  });

  describe('hooks', () => {
    const hooks = {
      beforeEach: vi.fn(),
      onStart: vi.fn(),
      onEnd: vi.fn(),
      onError: vi.fn(),
      onLoading: vi.fn(),
      onLoaded: vi.fn(),
    };

    it('should subscribe to router hooks when mounted', async () => {
      expect.assertions(6);

      render(RouterView, { router, ...hooks });
      await router.push({ path: '/hello' });

      expect(hooks.beforeEach).toHaveBeenCalledTimes(1);
      expect(hooks.onStart).toHaveBeenCalledTimes(1);
      expect(hooks.onEnd).toHaveBeenCalledTimes(1);

      expect(hooks.onLoading).not.toHaveBeenCalled();
      expect(hooks.onLoaded).toHaveBeenCalledTimes(1);

      expect(hooks.onError).not.toHaveBeenCalled();
    });

    it('should trigger onLoading while loading async component', async () => {
      expect.assertions(6);
      render(RouterView, { router, ...hooks });
      await router.push({ path: '/loading' });

      await wait(500);

      expect(hooks.beforeEach).toHaveBeenCalledTimes(1);
      expect(hooks.onStart).toHaveBeenCalledTimes(1);
      expect(hooks.onEnd).toHaveBeenCalledTimes(1);

      expect(hooks.onLoading).toHaveBeenCalledTimes(1);
      expect(hooks.onLoaded).toHaveBeenCalledTimes(1);

      expect(hooks.onError).not.toHaveBeenCalled();
    });

    it('should trigger onError when loading error component', async () => {
      expect.assertions(7);
      render(RouterView, { router, ...hooks });
      await router.push({ path: '/error' });

      expect(hooks.beforeEach).toHaveBeenCalledTimes(1);
      expect(hooks.onStart).toHaveBeenCalledTimes(1);
      expect(hooks.onEnd).toHaveBeenCalledTimes(1);

      expect(hooks.onLoaded).not.toHaveBeenCalled();
      expect(hooks.onLoading).toHaveBeenCalledTimes(1);

      expect(hooks.onError).toHaveBeenCalledTimes(1);
      expect(hooks.onError).toHaveBeenCalledWith(new Error('Loading error'), { route: expect.any(Object) });
    });

    it('should stop listening to router hooks when unmounted', async () => {
      expect.assertions(9);

      const { unmount } = render(RouterView, { router, ...hooks });
      await router.push({ path: '/hello' });

      expect(hooks.beforeEach).toHaveBeenCalledTimes(1);
      expect(hooks.onStart).toHaveBeenCalledTimes(1);
      expect(hooks.onEnd).toHaveBeenCalledTimes(1);

      await router.push({ path: '/goodbye' });
      await wait(100);

      expect(hooks.beforeEach).toHaveBeenCalledTimes(2);
      expect(hooks.onStart).toHaveBeenCalledTimes(2);
      expect(hooks.onEnd).toHaveBeenCalledTimes(2);

      unmount();
      await router.push({ path: '/hello' });

      expect(hooks.beforeEach).toHaveBeenCalledTimes(2);
      expect(hooks.onStart).toHaveBeenCalledTimes(2);
      expect(hooks.onEnd).toHaveBeenCalledTimes(2);
    });
  });
});
