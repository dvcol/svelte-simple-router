import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Links from './Links.test.svelte';

import type { Route } from '~/models/route.model.js';

import { Router } from '~/router/router.svelte.js';

describe('link', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('click', () => {
    const activeNodes = [
      // Default
      { node: 'anchor-path', payload: { path: HomeRoute.path } },
      { node: 'span-path', payload: { path: HomeRoute.path } },
      { node: 'span-name', payload: { name: HomeRoute.name } },
      { node: 'nested-anchor-path', payload: { path: HomeRoute.path } },
      { node: 'nested-span-name', payload: { name: HomeRoute.name } },

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

    const inactiveNodes = [
      // Boundary
      { node: 'boundary-anchor-path' },
      { node: 'boundary-span-path' },
      { node: 'boundary-span-name' },
      { node: 'outside-boundary' },

      // Outside
      { node: 'outside-anchor-path' },
      { node: 'outside-span-path' },
      { node: 'outside-span-name' },
    ];

    it.each(activeNodes)('should navigate to the link on click for `%s`', async ({ node, payload, options = {} }) => {
      expect.assertions(1);

      const user = userEvent.setup();
      render(Links, { router });

      const target = screen.getByTestId(node);

      await user.click(target);

      expect(spyPush).toHaveBeenCalledWith(payload, options);
    });

    it.each(inactiveNodes)('should not navigate on click for `%s`', async ({ node }) => {
      expect.assertions(1);

      const user = userEvent.setup();
      render(Links, { router });

      const target = screen.getByTestId(node);

      await user.click(target);

      expect(spyPush).not.toHaveBeenCalled();
    });
  });
});
