import type { Route, RouteNavigation } from '~/models/route.model.js';

import type { RouterNavigationOptions } from '../../src/lib';

import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Router } from '~/router/router.svelte.js';

import Links from './Links.test.svelte';

describe('links', () => {
  const HomeRoute: Route = {
    name: 'home',
    path: '/home',
  };
  const UserRoute: Route = {
    name: 'user',
    path: '/home/:id/user/:name',
  };

  const router = new Router({
    routes: [HomeRoute, UserRoute],
  });

  const spyPush = vi.spyOn(router, 'push').mockReturnValue(undefined);
  const spyReplace = vi.spyOn(router, 'replace').mockReturnValue(undefined);
  const spyResolve = vi.spyOn(router, 'resolve').mockReturnValue(undefined);

  beforeEach(async () => {
    await router.init();
    vi.clearAllMocks();
  });

  describe('click', () => {
    interface NodeParams {
      node: string;
      payload?: RouteNavigation;
      options?: RouterNavigationOptions;
      replace?: boolean;
    }
    const activeNodes: NodeParams[] = [
      // Default
      { node: 'anchor-path', payload: { path: HomeRoute.path } },
      { node: 'span-path', payload: { path: HomeRoute.path } },
      { node: 'span-name', payload: { name: HomeRoute.name } },
      { node: 'nested-anchor-path', payload: { path: HomeRoute.path } },
      { node: 'nested-span-name', payload: { name: HomeRoute.name } },

      // Navigate
      { node: 'navigate-anchor-path', payload: { path: HomeRoute.path }, replace: true },
      { node: 'navigate-span-path', payload: { path: HomeRoute.path }, replace: true },
      { node: 'navigate-span-name', payload: { name: HomeRoute.name }, replace: true },
      { node: 'navigate-nested-anchor-path', payload: { path: HomeRoute.path }, replace: true },
      { node: 'navigate-nested-span-name', payload: { name: HomeRoute.name }, replace: true },

      // Apply
      { node: 'apply-anchor-path', payload: { path: HomeRoute.path } },
      { node: 'apply-span-path', payload: { path: HomeRoute.path } },
      { node: 'apply-span-name', payload: { name: HomeRoute.name } },
      { node: 'apply-nested-anchor-path', payload: { path: HomeRoute.path } },
      { node: 'apply-nested-span-name', payload: { name: HomeRoute.name } },

      // Boundary
      { node: 'boundary-nested-anchor-path', payload: { path: HomeRoute.path } },
      { node: 'boundary-nested-span-name', payload: { name: HomeRoute.name } },
    ];

    const inactiveNodes: NodeParams[] = [
      { node: 'boundary-anchor-path' },
      { node: 'boundary-span-path' },
      { node: 'boundary-span-name' },
      { node: 'outside-boundary' },

      // Outside
      { node: 'outside-anchor-path' },
      { node: 'outside-span-path' },
      { node: 'outside-span-name' },
    ];

    it.each(activeNodes)('should navigate to the link on click for `%s`', async ({ node, payload, options = {}, replace }) => {
      expect.assertions(2);

      const user = userEvent.setup();
      render(Links, { router });

      const target = screen.getByTestId(node);

      await user.click(target);

      expect(replace ? spyReplace : spyPush).toHaveBeenCalledWith(payload, { ...options });
      expect(replace ? spyPush : spyReplace).not.toHaveBeenCalled();
    });

    it.each(inactiveNodes)('should not navigate on click for `%s`', async ({ node }) => {
      expect.assertions(2);

      const user = userEvent.setup();
      render(Links, { router });

      const target = screen.getByTestId(node);

      await user.click(target);

      expect(spyPush).not.toHaveBeenCalled();
      expect(spyReplace).not.toHaveBeenCalled();
    });
  });

  describe('resolve', () => {
    const resolveFalse: { node: string }[] = [
      { node: 'anchor-path' },
      { node: 'span-path' },
      { node: 'span-name' },

      // Outside
      { node: 'nested-anchor-path' },
      { node: 'nested-span-path' },
      { node: 'nested-span-name' },
    ];

    it.each(resolveFalse)('should not resolve route on hover for `%s`', async ({ node }) => {
      expect.assertions(1);

      const user = userEvent.setup();
      render(Links, { router });

      const target = screen.getByTestId(node);
      await user.hover(target);
      target.focus();

      expect(spyResolve).not.toHaveBeenCalled();
    });

    const resolveTrue: { node: string; payload: { name: string } | { path: string } }[] = [
      { node: 'resolve-anchor-path', payload: { path: '/home' } },
      { node: 'resolve-span-path', payload: { path: '/home' } },
      { node: 'resolve-span-name', payload: { name: 'home' } },

      // Outside
      { node: 'resolve-nested-anchor-path', payload: { path: '/home' } },
      { node: 'resolve-nested-span-path', payload: { path: '/home' } },
      { node: 'resolve-nested-span-name', payload: { name: 'home' } },
    ];

    it.each(resolveTrue)('should resolve route on hover for `%s`', async ({ node, payload }) => {
      expect.assertions(2);

      const user = userEvent.setup();
      render(Links, { router });

      const target = screen.getByTestId(node);
      await user.hover(target);

      expect(spyResolve).toHaveBeenCalledTimes(1);
      expect(spyResolve).toHaveBeenCalledWith(payload, {});
    });

    it.each(resolveTrue)('should resolve route on focus for `%s`', async ({ node, payload }) => {
      expect.assertions(2);

      render(Links, { router });
      screen.getByTestId(node)?.focus();

      expect(spyResolve).toHaveBeenCalledTimes(1);
      expect(spyResolve).toHaveBeenCalledWith(payload, {});
    });
  });
});
