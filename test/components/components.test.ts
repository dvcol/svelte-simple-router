import { wait } from '@dvcol/common-utils/common/promise';

import { cleanup, render, screen } from '@testing-library/svelte';

import { tick } from 'svelte';

import { afterEach, assert, beforeEach, describe, expect, it, vi } from 'vitest';

import RouteView from './RouteView.test.svelte';

import RouterContext from './RouterContext.test.svelte';
import RouterView from './RouterView.test.svelte';
import RouterViewNested from './RouterViewNested.test.svelte';

import LoadingComponent from './stub/LoadingComponent.test.svelte';
import { LifeCycle } from './stub/mocks.js';
import { namedPartialRoute, partialRoute, routes } from './stub/routes.js';

import type { RenderResult } from '@testing-library/svelte';

import type { MockInstance } from 'vitest';

import RouteTransition from '~/components/RouteTransition.svelte';
import { NavigationEvent, ViewChangeEvent } from '~/router/event.svelte.js';
import { Router } from '~/router/router.svelte.js';
import { transition } from '~/utils/transition.utils.js';

describe('routerView', () => {
  let router: Router;

  let addRoute: MockInstance<typeof router.addRoute>;
  let removeRoute: MockInstance<typeof router.removeRoute>;

  afterEach(async () => {
    cleanup();
    window.history.pushState({}, '', '/');
  });

  beforeEach(async () => {
    router = new Router({ routes, hash: true, listen: false });
    await wait();
    addRoute = vi.spyOn(router, 'addRoute');
    removeRoute = vi.spyOn(router, 'removeRoute');
    vi.clearAllMocks();
  });

  const assertComponent = (inputs: { id: string; title: string; meta: string }) => {
    const component = screen.getByTestId(inputs.id);
    expect(component).toBeDefined();

    const title = component.querySelector('h2[data-testid="title"]');
    expect(title).toBeDefined();
    expect(title?.textContent).toBe(inputs.title);

    const meta = component.querySelector('h2[data-testid="meta"]');
    expect(meta).toBeDefined();
    expect(meta?.textContent).toBe(inputs.meta);
    return { component, title, meta };
  };

  describe('routing', () => {
    const common = (component: typeof RouteView | typeof RouterContext | typeof RouterViewNested) => {
      it('should render no component', () => {
        expect.assertions(4);
        render(component, { router });

        expect(() => screen.getByTestId('hello-component')).toThrow('Unable to find an element by: [data-testid="hello-component"]');

        expect(LifeCycle.Error.onMounted).not.toHaveBeenCalled();
        expect(LifeCycle.Hello.onMounted).not.toHaveBeenCalled();
        expect(LifeCycle.Goodbye.onMounted).not.toHaveBeenCalled();
      });

      it('should render a hello component', async () => {
        expect.assertions(8);

        render(component, { router });
        await router.push({ path: '/hello' });

        assertComponent({ id: 'hello-component', title: 'Hello', meta: 'Hello' });

        expect(LifeCycle.Error.onMounted).not.toHaveBeenCalled();
        expect(LifeCycle.Hello.onMounted).toHaveBeenCalledTimes(1);
        expect(LifeCycle.Goodbye.onMounted).not.toHaveBeenCalled();
      });

      it('should render a async component', async () => {
        expect.assertions(8);

        render(component, { router });
        await router.push({ path: '/goodbye' });
        await tick();

        // wait for the component to load
        await wait(100);

        assertComponent({ id: 'goodbye-component', title: 'Goodbye', meta: 'Goodbye' });

        expect(LifeCycle.Error.onMounted).not.toHaveBeenCalled();
        expect(LifeCycle.Hello.onMounted).not.toHaveBeenCalled();
        expect(LifeCycle.Goodbye.onMounted).toHaveBeenCalledTimes(1);
      });

      it('should render a loading component', async () => {
        expect.assertions(5);

        render(component, { router });
        await router.push({ path: '/loading' });

        const loading = screen.getByTestId('loading-component');
        expect(loading).toBeDefined();

        await wait(500);

        const hello = screen.getByTestId('hello-component');
        expect(hello).toBeDefined();

        expect(LifeCycle.Error.onMounted).not.toHaveBeenCalled();
        expect(LifeCycle.Hello.onMounted).toHaveBeenCalledTimes(1);
        expect(LifeCycle.Goodbye.onMounted).not.toHaveBeenCalled();
      });

      it('should render a default loading component', async () => {
        expect.assertions(5);

        render(component, { router });
        await router.push({ path: '/default-loading' });

        const loading = screen.getByTestId('default-loading');
        expect(loading).toBeDefined();

        await wait(500);

        const hello = screen.getByTestId('hello-component');
        expect(hello).toBeDefined();

        expect(LifeCycle.Error.onMounted).not.toHaveBeenCalled();
        expect(LifeCycle.Hello.onMounted).toHaveBeenCalledTimes(1);
        expect(LifeCycle.Goodbye.onMounted).not.toHaveBeenCalled();
      });

      it('should render an error component', async () => {
        expect.assertions(6);

        render(component, { router });
        await router.push({ path: '/error' });
        await tick();

        const errorComponent = screen.getByTestId('error-component');
        expect(errorComponent).toBeDefined();

        const message = errorComponent.querySelector('p[data-testid="error-message"]');
        expect(message).toBeDefined();
        expect(message?.textContent).toBe('Loading error');

        expect(LifeCycle.Error.onMounted).toHaveBeenCalledTimes(1);
        expect(LifeCycle.Hello.onMounted).not.toHaveBeenCalled();
        expect(LifeCycle.Goodbye.onMounted).not.toHaveBeenCalled();
      });

      it('should render a default error component', async () => {
        expect.assertions(6);

        render(component, { router });
        await router.push({ path: '/default-error' });
        await tick();

        const errorComponent = screen.getByTestId('default-error');
        expect(errorComponent).toBeDefined();

        const message = errorComponent.querySelector('p[data-testid="error-message"]');
        expect(message).toBeDefined();
        expect(message?.textContent).toBe('Default Error');

        expect(LifeCycle.Error.onMounted).not.toHaveBeenCalled();
        expect(LifeCycle.Hello.onMounted).not.toHaveBeenCalled();
        expect(LifeCycle.Goodbye.onMounted).not.toHaveBeenCalled();
      });

      it('should render a routing snippet', async () => {
        expect.assertions(8);

        await router.push({ path: '/goodbye' });
        render(component, { router });
        const routing$ = router.push({ name: 'routing' });

        // wait for the component to load
        await wait(100);

        const routing = screen.getByTestId('default-routing');
        expect(routing).toBeDefined();
        const from = routing.querySelector('span[data-testid="routing-from"]');
        expect(from?.textContent).toBe('goodbye');
        const to = routing.querySelector('span[data-testid="routing-to"]');
        expect(to?.textContent).toBe('routing');

        await routing$;
        await wait(100);

        const loading = screen.getByTestId('default-loading');
        expect(loading).toBeDefined();

        await wait(200);

        const hello = screen.getByTestId('hello-component');
        expect(hello).toBeDefined();

        expect(LifeCycle.Error.onMounted).not.toHaveBeenCalled();
        expect(LifeCycle.Hello.onMounted).toHaveBeenCalledTimes(1);
        expect(LifeCycle.Goodbye.onMounted).toHaveBeenCalledTimes(1);
      });

      it('should not render a component when navigating in place', async () => {
        expect.assertions(9);

        render(component, { router });
        await router.push({ path: '/hello' });

        assertComponent({ id: 'hello-component', title: 'Hello', meta: 'Hello' });
        expect(LifeCycle.Hello.onMounted).toHaveBeenCalledTimes(1);
        expect(LifeCycle.Hello.onDestroyed).not.toHaveBeenCalled();

        await router.push({ path: '/hello' });
        await tick();

        expect(LifeCycle.Hello.onMounted).toHaveBeenCalledTimes(1);
        expect(LifeCycle.Hello.onDestroyed).not.toHaveBeenCalled();
      });

      it('should force render a component when navigating in place', async () => {
        expect.assertions(9);

        render(component, { router });
        await router.push({ path: '/hello' });

        expect(LifeCycle.Hello.onMounted).toHaveBeenCalledTimes(1);
        expect(LifeCycle.Hello.onDestroyed).not.toHaveBeenCalled();

        await router.push({ path: '/hello' }, { force: true });

        expect(LifeCycle.Hello.onMounted).toHaveBeenCalledTimes(2);
        expect(LifeCycle.Hello.onDestroyed).toHaveBeenCalledTimes(1);

        assertComponent({ id: 'hello-component', title: 'Hello', meta: 'Hello' });
      });
    };

    describe('single view', () => common(RouterView));

    const nested = (component: typeof RouteView | typeof RouterContext | typeof RouterViewNested) => {
      common(component);

      it('should render nested components', async () => {
        expect.assertions(12);

        render(RouterContext, { router });
        await router.push({ path: '/nested' });

        // wait for the component to load
        await wait(100);

        assertComponent({ id: 'hello-component', title: 'Nested Hello', meta: 'Nested' });
        assertComponent({ id: 'goodbye-component', title: 'Nested Goodbye', meta: 'Nested' });

        await router.push({ path: '/hello' });

        expect(screen.getByTestId('hello-component')).toBeDefined();
        expect(() => screen.getByTestId('goodbye-component')).toThrow('Unable to find an element by: [data-testid="goodbye-component"]');
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
      onChange: vi.fn(),
      onLoading: vi.fn(),
      onLoaded: vi.fn(),
    };

    let result: RenderResult<typeof RouteView>;

    beforeEach(async () => {
      result = render(RouterView, { router, ...hooks });
      await tick();
      vi.clearAllMocks();
    });

    it('should subscribe to router hooks when mounted', async () => {
      expect.assertions(8);

      await router.push({ path: '/hello' });

      expect(hooks.beforeEach).toHaveBeenCalledTimes(1);
      expect(hooks.beforeEach).toHaveBeenCalledWith(expect.any(NavigationEvent));
      expect(hooks.onStart).toHaveBeenCalledTimes(1);
      expect(hooks.onEnd).toHaveBeenCalledTimes(1);

      expect(hooks.onLoading).not.toHaveBeenCalled();
      expect(hooks.onChange).toHaveBeenCalledTimes(1);
      expect(hooks.onLoaded).toHaveBeenCalledTimes(1);

      expect(hooks.onError).not.toHaveBeenCalled();
    });

    it('should trigger onLoading while loading async component', async () => {
      expect.assertions(8);

      await router.push({ path: '/loading' });
      await wait(500);

      expect(hooks.beforeEach).toHaveBeenCalledTimes(1);
      expect(hooks.beforeEach).toHaveBeenCalledWith(expect.any(NavigationEvent));
      expect(hooks.onStart).toHaveBeenCalledTimes(1);
      expect(hooks.onEnd).toHaveBeenCalledTimes(1);

      expect(hooks.onChange).toHaveBeenCalledTimes(1);
      expect(hooks.onLoading).toHaveBeenCalledTimes(1);
      expect(hooks.onLoaded).toHaveBeenCalledTimes(1);

      expect(hooks.onError).not.toHaveBeenCalled();
    });

    it('should trigger onError when loading error component', async () => {
      expect.assertions(9);

      await router.push({ path: '/error' });
      await tick();

      expect(hooks.beforeEach).toHaveBeenCalledTimes(1);
      expect(hooks.beforeEach).toHaveBeenCalledWith(expect.any(NavigationEvent));
      expect(hooks.onStart).toHaveBeenCalledTimes(1);
      expect(hooks.onEnd).toHaveBeenCalledTimes(1);

      expect(hooks.onLoaded).not.toHaveBeenCalled();
      expect(hooks.onChange).toHaveBeenCalledTimes(1);
      expect(hooks.onLoading).toHaveBeenCalledTimes(1);

      expect(hooks.onError).toHaveBeenCalledTimes(1);
      expect(hooks.onError).toHaveBeenCalledWith(new Error('Loading error'), expect.any(ViewChangeEvent));
    });

    it('should stop listening to router hooks when unmounted', async () => {
      expect.assertions(10);

      await router.push({ path: '/hello' });
      await tick();

      expect(hooks.beforeEach).toHaveBeenCalledTimes(1);
      expect(hooks.beforeEach).toHaveBeenCalledWith(expect.any(NavigationEvent));
      expect(hooks.onStart).toHaveBeenCalledTimes(1);
      expect(hooks.onEnd).toHaveBeenCalledTimes(1);

      await router.push({ path: '/goodbye' });
      await wait(100);

      expect(hooks.beforeEach).toHaveBeenCalledTimes(2);
      expect(hooks.onStart).toHaveBeenCalledTimes(2);
      expect(hooks.onEnd).toHaveBeenCalledTimes(2);

      result.unmount();
      await router.push({ path: '/hello' });

      expect(hooks.beforeEach).toHaveBeenCalledTimes(2);
      expect(hooks.onStart).toHaveBeenCalledTimes(2);
      expect(hooks.onEnd).toHaveBeenCalledTimes(2);
    });
  });

  describe('routeView', () => {
    it('should inject a route into the router', async () => {
      expect.assertions(8);

      const comp = render(RouteView, { router, route: partialRoute });
      await router.push({ path: partialRoute.path });

      expect(addRoute).toHaveBeenCalledTimes(1);
      expect(addRoute).toHaveBeenCalledWith(partialRoute);
      expect(removeRoute).not.toHaveBeenCalled();
      expect(router.hasRoute(partialRoute)).toBeTruthy();

      comp.unmount();

      expect(addRoute).toHaveBeenCalledTimes(1);
      expect(removeRoute).toHaveBeenCalledTimes(1);
      expect(removeRoute).toHaveBeenCalledWith(partialRoute);
      expect(router.hasRoute(partialRoute)).toBeFalsy();
    });

    it('should inject a route into a named routerView', async () => {
      expect.assertions(12);

      const comp = render(RouteView, { router, route: partialRoute, namedRoute: namedPartialRoute });
      await router.push({ path: partialRoute.path });

      expect(addRoute).toHaveBeenCalledTimes(2);
      expect(addRoute).toHaveBeenCalledWith(partialRoute);
      expect(addRoute).toHaveBeenCalledWith(namedPartialRoute);
      expect(removeRoute).not.toHaveBeenCalled();
      expect(router.hasRoute(partialRoute)).toBeTruthy();
      expect(router.hasRoute(namedPartialRoute)).toBeTruthy();

      comp.unmount();

      expect(addRoute).toHaveBeenCalledTimes(2);
      expect(removeRoute).toHaveBeenCalledTimes(2);
      expect(removeRoute).toHaveBeenCalledWith(partialRoute);
      expect(removeRoute).toHaveBeenCalledWith(namedPartialRoute);
      expect(router.hasRoute(partialRoute)).toBeFalsy();
      expect(router.hasRoute(namedPartialRoute)).toBeFalsy();
    });

    it('should render the route component', async () => {
      expect.assertions(8);

      const comp = render(RouteView, { router, route: partialRoute, namedRoute: namedPartialRoute });
      await router.push({ path: partialRoute.path });
      await wait(100);

      assertComponent({ id: 'hello-component', title: 'Route View', meta: 'Route View' });
      expect(router.hasRoute(partialRoute)).toBeTruthy();

      comp.unmount();

      expect(() => screen.getByTestId('hello-component')).toThrow('Unable to find an element by: [data-testid="hello-component"]');
      expect(router.hasRoute(partialRoute)).toBeFalsy();
    });

    it('should render the named route component', async () => {
      expect.assertions(14);

      const comp = render(RouteView, { router, route: partialRoute, namedRoute: namedPartialRoute });
      await router.push({ path: namedPartialRoute.path });
      await wait(100);

      assertComponent({ id: 'hello-component', title: 'Named Route View Hello', meta: 'Named Route View' });
      assertComponent({ id: 'goodbye-component', title: 'Named Route View Goodbye', meta: 'Named Route View' });
      expect(router.hasRoute(namedPartialRoute)).toBeTruthy();

      comp.unmount();

      expect(() => screen.getByTestId('hello-component')).toThrow('Unable to find an element by: [data-testid="hello-component"]');
      expect(() => screen.getByTestId('goodbye-component')).toThrow('Unable to find an element by: [data-testid="goodbye-component"]');
      expect(router.hasRoute(namedPartialRoute)).toBeFalsy();
    });

    it('should render the route children', async () => {
      expect.assertions(6);

      const comp = render(RouteView, {
        router,
        route: { ...partialRoute, component: undefined },
        namedRoute: { ...namedPartialRoute, components: undefined },
      });
      await router.push({ path: partialRoute.path });
      await wait(100);

      expect(() => screen.getByTestId('hello-component')).toThrow('Unable to find an element by: [data-testid="hello-component"]');
      expect(screen.getByTestId('default-route-view')).toBeDefined();
      expect(router.hasRoute(partialRoute)).toBeTruthy();

      comp.unmount();

      expect(() => screen.getByTestId('hello-component')).toThrow('Unable to find an element by: [data-testid="hello-component"]');
      expect(() => screen.getByTestId('default-route-view')).toThrow('Unable to find an element by: [data-testid="default-route-view"]');
      expect(router.hasRoute(partialRoute)).toBeFalsy();
    });

    it('should render the named route children', async () => {
      expect.assertions(7);

      const comp = render(RouteView, {
        router,
        route: { ...partialRoute, component: undefined },
        namedRoute: { ...namedPartialRoute, components: undefined },
      });
      await router.push({ path: namedPartialRoute.path });
      await wait(100);

      expect(() => screen.getByTestId('hello-component')).toThrow('Unable to find an element by: [data-testid="hello-component"]');
      expect(() => screen.getByTestId('goodbye-component')).toThrow('Unable to find an element by: [data-testid="goodbye-component"]');
      expect(screen.getByTestId('nested-route-view')).toBeDefined();
      expect(router.hasRoute(partialRoute)).toBeTruthy();

      comp.unmount();

      expect(() => screen.getByTestId('hello-component')).toThrow('Unable to find an element by: [data-testid="hello-component"]');
      expect(() => screen.getByTestId('nested-route-view')).toThrow('Unable to find an element by: [data-testid="nested-route-view"]');
      expect(router.hasRoute(partialRoute)).toBeFalsy();
    });

    it('should render nested route components with snippets', async () => {
      expect.assertions(10);

      const comp = render(RouteView, {
        router,
        route: { ...partialRoute, component: undefined },
        namedRoute: { ...namedPartialRoute, components: undefined },
        snippets: true,
      });
      await router.push({ path: partialRoute.path });
      await wait(100);

      expect(() => screen.getByTestId('hello-component')).toThrow('Unable to find an element by: [data-testid="hello-component"]');
      expect(() => screen.getByTestId('goodbye-component')).toThrow('Unable to find an element by: [data-testid="goodbye-component"]');
      expect(() => screen.getByTestId('nested-route-view')).toThrow('Unable to find an element by: [data-testid="nested-route-view"]');
      expect(() => screen.getByTestId('nested-route-view-snippet')).toThrow(
        'Unable to find an element by: [data-testid="nested-route-view-snippet"]',
      );
      expect(screen.getByTestId('default-route-view')).toBeDefined();
      expect(screen.getByTestId('default-route-view-snippet')).toBeDefined();
      expect(router.hasRoute(partialRoute)).toBeTruthy();

      comp.unmount();

      expect(() => screen.getByTestId('default-route-view')).toThrow('Unable to find an element by: [data-testid="default-route-view"]');
      expect(() => screen.getByTestId('default-route-view-snippet')).toThrow(
        'Unable to find an element by: [data-testid="default-route-view-snippet"]',
      );
      expect(router.hasRoute(partialRoute)).toBeFalsy();
    });

    it('should render named route components with snippets', async () => {
      expect.assertions(10);

      const comp = render(RouteView, {
        router,
        route: { ...partialRoute, component: undefined },
        namedRoute: { ...namedPartialRoute, components: undefined },
        snippets: true,
      });
      await router.push({ path: namedPartialRoute.path });
      await wait(100);

      expect(() => screen.getByTestId('hello-component')).toThrow('Unable to find an element by: [data-testid="hello-component"]');
      expect(() => screen.getByTestId('goodbye-component')).toThrow('Unable to find an element by: [data-testid="goodbye-component"]');
      expect(() => screen.getByTestId('default-route-view')).toThrow('Unable to find an element by: [data-testid="default-route-view"]');
      expect(() => screen.getByTestId('default-route-view-snippet')).toThrow(
        'Unable to find an element by: [data-testid="default-route-view-snippet"]',
      );
      expect(screen.getByTestId('nested-route-view')).toBeDefined();
      expect(screen.getByTestId('nested-route-view-snippet')).toBeDefined();
      expect(router.hasRoute(partialRoute)).toBeTruthy();

      comp.unmount();

      expect(() => screen.getByTestId('nested-route-view')).toThrow('Unable to find an element by: [data-testid="nested-route-view"]');
      expect(() => screen.getByTestId('nested-route-view-snippet')).toThrow(
        'Unable to find an element by: [data-testid="nested-route-view-snippet"]',
      );
      expect(router.hasRoute(partialRoute)).toBeFalsy();
    });

    it('should render the route error component', async () => {
      expect.assertions(3);

      render(RouteView, { router, route: { ...partialRoute, component: () => Promise.reject(new Error('Loading error')) } });
      await router.push({ path: partialRoute.path });
      await tick();

      const errorComponent = screen.getByTestId('error-component');
      expect(errorComponent).toBeDefined();

      const message = errorComponent.querySelector('p[data-testid="error-message"]');
      expect(message).toBeDefined();
      expect(message?.textContent).toBe('Loading error');
    });

    it('should render the route error snippet', async () => {
      expect.assertions(3);

      render(RouteView, { router, route: { ...partialRoute, error: undefined, component: () => Promise.reject(new Error('Loading error')) } });
      await router.push({ path: partialRoute.path });
      await tick();

      const errorComponent = screen.getByTestId('default-error');
      expect(errorComponent).toBeDefined();

      const message = errorComponent.querySelector('p[data-testid="error-message"]');
      expect(message).toBeDefined();
      expect(message?.textContent).toBe('Loading error');
    });

    it('should render the route loading component', async () => {
      expect.assertions(2);

      render(RouteView, {
        router,
        route: {
          ...partialRoute,
          component: async () => {
            await wait(200);
            return import('./stub/HelloComponent.test.svelte');
          },
        },
      });
      await router.push({ path: partialRoute.path });

      const loading = screen.getByTestId('loading-component');
      expect(loading).toBeDefined();

      await wait(500);

      const hello = screen.getByTestId('hello-component');
      expect(hello).toBeDefined();
    });

    it('should render the route loading snippet', async () => {
      expect.assertions(2);

      render(RouteView, {
        router,
        route: {
          ...partialRoute,
          loading: undefined,
          component: async () => {
            await wait(200);
            return import('./stub/HelloComponent.test.svelte');
          },
        },
      });
      await router.push({ path: partialRoute.path });

      const loading = screen.getByTestId('default-loading');
      expect(loading).toBeDefined();

      await wait(500);

      const hello = screen.getByTestId('hello-component');
      expect(hello).toBeDefined();
    });
  });

  describe('routeTransition', () => {
    const assertsWrapper = () => {
      const container = document.querySelector<HTMLDivElement>('[data-transition-id="container"]');

      expect(container).not.toBeNull();
      assert(container !== null);
      expect(container.children).toHaveLength(1);

      const wrapper = container.querySelector<HTMLDivElement>('[data-transition-id="wrapper"]');

      expect(wrapper).not.toBeNull();
      assert(wrapper !== null);
      expect(wrapper.children).toHaveLength(1);

      expect(getComputedStyle(wrapper).getPropertyValue('--container-transition-name')).toBe('');

      expect(screen.getByTestId('loading-component')).toBeDefined();
    };

    it('should wrap component in transition container & wrapper if `in` transition is provided', () => {
      expect.assertions(6);

      render(RouteTransition, {
        transition: { in: transition.in },
        children: LoadingComponent,
      });

      assertsWrapper();
    });

    it('should wrap component in transition container & wrapper if `out` transition is provided', () => {
      expect.assertions(6);

      render(RouteTransition, {
        transition: { out: transition.out },
        children: LoadingComponent,
      });

      assertsWrapper();
    });

    it('should wrap component in transition container and wrapper if `in` and `out` transitions are provided', () => {
      expect.assertions(6);

      render(RouteTransition, {
        transition,
        children: LoadingComponent,
      });

      assertsWrapper();
    });

    const assertNoWrapper = () => {
      const container = document.querySelector<HTMLDivElement>('[data-transition-id="container"]');

      expect(container).toBeDefined();
      assert(container !== null);
      expect(container?.children).toHaveLength(1);

      const wrapper = container.querySelector<HTMLDivElement>('[data-transition-id="wrapper"]');

      expect(wrapper).toBeNull();
      assert(wrapper === null);

      return container;
    };

    it('should wrap component in transition container and add view-transition-name if `viewTransitionName` is true', () => {
      expect.assertions(4);

      const id = 'my-view-transition-id';
      render(RouteTransition, {
        id,
        transition: { viewTransitionName: true },
        children: LoadingComponent,
      });

      const container = assertNoWrapper();
      expect(getComputedStyle(container).getPropertyValue('--container-transition-name')).toBe(`sr-container-${id}`);
    });

    it('should wrap component in transition container and add view-transition-name if `viewTransitionName` is a string', () => {
      expect.assertions(4);

      const id = 'my-view-transition-id';
      const name = 'my-view-transition-name';
      render(RouteTransition, {
        id,
        transition: { viewTransitionName: name },
        children: LoadingComponent,
      });

      const container = assertNoWrapper();
      expect(getComputedStyle(container).getPropertyValue('--container-transition-name')).toBe(name);
    });
  });
});
