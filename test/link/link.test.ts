import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';

import { tick } from 'svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Link from './Link.test.svelte';

import type { Route } from '~/models/route.model.js';

import { active } from '~/router/active.svelte.js';
import { Router } from '~/router/router.svelte.js';
import * as UseRouterModule from '~/router/use-router.svelte.js';
import { Logger } from '~/utils/logger.utils.js';

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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('init', () => {
    const mockNode = {
      getAttribute: vi.fn(),
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
    } as unknown as HTMLElement;

    const spyLoger = vi.spyOn(Logger.logger, 'warn').mockReturnValue(undefined);
    const spyRouter = vi.spyOn(UseRouterModule, 'useRouter').mockReturnValue(router);

    it('should exit, warn and add a data-error attribute if the router is not found', () => {
      expect.assertions(3);

      spyRouter.mockReturnValueOnce(undefined);

      active(mockNode, {});

      expect(spyRouter).toHaveBeenCalledWith();
      expect(spyLoger).toHaveBeenCalledWith('Router not found. Make sure you are using the active action within a Router context.', {
        node: mockNode,
        options: {},
      });
      expect(mockNode.setAttribute).toHaveBeenCalledWith('data-error', 'Router not found.');
    });
  });

  it('should set the role and tabindex attributes if the target is not an anchor element', async () => {
    expect.assertions(4);

    render(Link, { router });

    const spanPath = screen.getByTestId('span-path');
    const spanName = screen.getByTestId('span-name');

    // await tick to allow the action to update the attributes
    await tick();

    expect(spanPath.getAttribute('role')).toBe('link');
    expect(spanPath.getAttribute('tabindex')).toBe('0');

    expect(spanName.getAttribute('role')).toBe('link');
    expect(spanName.getAttribute('tabindex')).toBe('0');
  });

  it('should add a href attribute if the target is an anchor element and no href is provided', async () => {
    expect.assertions(1);

    render(Link, { router });

    const anchorNoHref = screen.getByTestId('anchor-no-href');

    // await tick to allow the action to update the attributes
    await tick();

    expect(anchorNoHref.getAttribute('href')).toBe('/home');
  });

  describe('click', () => {
    const nodes = [
      { node: 'anchor-path', payload: { path: HomeRoute.path } },
      { node: 'anchor-name', payload: { name: HomeRoute.name } },
      { node: 'anchor-no-href', payload: { path: HomeRoute.path } },
      { node: 'span-path', payload: { path: HomeRoute.path } },
      { node: 'span-name', payload: { name: HomeRoute.name } },
      { node: 'param-path', payload: { path: HomeRoute.path } },
      { node: 'param-name', payload: { name: HomeRoute.name } },
      { node: 'span-query-params', payload: { path: UserRoute.path, query: { search: 'value', filter: 42 }, params: { id: 12, name: 'john' } } },
      {
        node: 'span-query-params-string',
        payload: { path: UserRoute.path, query: { search: 'value', filter: 42 }, params: { id: 12, name: 'john' } },
      },
      {
        node: 'anchor-all-props',
        payload: {
          path: UserRoute.path,
          query: { search: 'value', filter: 42 },
          params: { id: 12, name: 'john' },
          state: { key: 'value' },
          stripQuery: true,
          stripHash: true,
          stripTrailingHash: true,
        },
        options: {
          base: '/base',
          hash: true,
          strict: true,
          force: true,
          failOnNotFound: true,
          metaAsState: true,
          nameAsTitle: true,
          followGuardRedirects: true,
        },
      },
      {
        node: 'anchor-merge-props',
        payload: {
          path: UserRoute.path,
          query: { search: 'value', filter: 42 },
          params: { id: 12, name: 'john' },
          state: { key: 'value' },
          stripQuery: true,
          stripHash: true,
          stripTrailingHash: true,
        },
        options: {
          base: '/base',
          hash: false,
          strict: true,
          force: true,
          failOnNotFound: true,
          metaAsState: true,
          nameAsTitle: true,
          followGuardRedirects: true,
        },
        replace: true,
      },
    ];

    it.each(nodes)('should navigate to the link on click for `%s`', async ({ node, payload, options, replace }) => {
      expect.assertions(2);

      const user = userEvent.setup();
      render(Link, { router });

      const target = screen.getByTestId(node);

      await user.click(target);

      expect(replace ? spyReplace : spyPush).toHaveBeenCalledWith(payload, { ...options });
      expect(replace ? spyPush : spyReplace).not.toHaveBeenCalled();
    });

    it.each(nodes)('should ignore the click event if the event is not a left click for `%s`', async ({ node }) => {
      expect.assertions(2);

      const user = userEvent.setup();
      render(Link, { router });

      const target = screen.getByTestId(node);
      await user.pointer({ keys: '[MouseRight]', target });

      expect(spyPush).not.toHaveBeenCalled();
      expect(spyReplace).not.toHaveBeenCalled();
    });

    it.each(nodes)('should ignore the click event if the event is a modifier click for `%s`', async ({ node }) => {
      expect.assertions(2);

      const user = userEvent.setup();
      render(Link, { router });

      const target = screen.getByTestId(node);

      await user.keyboard('[ShiftLeft>]');
      await user.click(target);
      await user.keyboard('[/ShiftLeft]');

      await user.keyboard('[ControlLeft>]');
      await user.click(target);
      await user.keyboard('[/ControlLeft]');

      await user.keyboard('[AltLeft>]');
      await user.click(target);
      await user.keyboard('[/AltLeft]');

      await user.keyboard('[MetaLeft>]');
      await user.click(target);
      await user.keyboard('[/MetaLeft]');

      expect(spyPush).not.toHaveBeenCalled();
      expect(spyReplace).not.toHaveBeenCalled();
    });

    it.each(nodes)('should navigate to the link on enter key for `%s`', async ({ node, payload, options, replace }) => {
      expect.assertions(2);

      const user = userEvent.setup();
      render(Link, { router });

      screen.getByTestId(node).focus();
      await user.keyboard('{enter}');

      expect(replace ? spyReplace : spyPush).toHaveBeenCalledWith(payload, { ...options });
      expect(replace ? spyPush : spyReplace).not.toHaveBeenCalled();
    });

    it.each(nodes)('should ignore the keyboard events if the key is not enter for `%s`', async ({ node }) => {
      expect.assertions(2);

      const user = userEvent.setup();
      render(Link, { router });

      screen.getByTestId(node).focus();
      await user.keyboard('{space}');

      expect(spyPush).not.toHaveBeenCalled();
      expect(spyReplace).not.toHaveBeenCalled();
    });
  });

  it('should ignore the click event if the target is not _self or empty', async () => {
    expect.assertions(2);

    const user = userEvent.setup();
    render(Link, { router });

    const target = screen.getByTestId('anchor-target-blank');
    await user.click(target);

    expect(spyPush).not.toHaveBeenCalled();
    expect(spyReplace).not.toHaveBeenCalled();
  });

  it('should ignore the click event if the target host is different', async () => {
    expect.assertions(2);

    const user = userEvent.setup();
    render(Link, { router });

    const target = screen.getByTestId('anchor-link-external');
    await user.click(target);

    expect(spyPush).not.toHaveBeenCalled();
    expect(spyReplace).not.toHaveBeenCalled();
  });

  it('should log an error if cannot parse the options', async () => {
    expect.assertions(2);
    const spyLoger = vi.spyOn(Logger.logger, 'error').mockReturnValue(undefined);

    const user = userEvent.setup();
    render(Link, { router });

    const target = screen.getByTestId('anchor-parsing-error');
    await user.click(target);

    expect(target.getAttribute('data-error')).toBe('Failed to parse JSON attribute "params"');
    expect(spyLoger).toHaveBeenCalledWith('Failed to parse JSON attribute "params" on <a> element', {
      element: expect.any(HTMLElement),
      name: 'params',
      error: expect.any(Error),
    });
  });
});
