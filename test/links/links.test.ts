import { render, screen } from "@testing-library/svelte";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Links from "./Links.test.svelte";

import type { RouterNavigationOptions } from "../../src/lib";
import type { Route, RouteNavigation } from "~/models/route.model.js";

import { Router } from "~/router/router.svelte.js";

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
  const spyReplace = vi.spyOn(router, 'replace').mockReturnValue(undefined);

  beforeEach(async () => {
    await router.init();
    vi.clearAllMocks();
  });

  describe('click', () => {
    type NodeParams = { node: string; payload?: RouteNavigation; options?: RouterNavigationOptions; replace?: boolean };
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
});
