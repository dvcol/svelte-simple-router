import type { Route } from '~/models/route.model.js';

import { render, screen } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { active } from '~/router/active.svelte.js';
import * as GetRouterModule from '~/router/context.svelte.js';
import { Router } from '~/router/router.svelte.js';
import { Logger } from '~/utils/logger.utils.js';

import Active from './Active.test.svelte';

describe('active', () => {
  const HomeRoute: Route = {
    name: 'home',
    path: '/home',
  };
  const TargetRoute: Route = {
    name: 'target',
    path: '/target',
  };
  const OtherRoute: Route = {
    name: 'other',
    path: '/other',
    children: [TargetRoute],
  };

  const router = new Router({
    routes: [HomeRoute, OtherRoute],
  });

  beforeEach(async () => {
    await router.init();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await router.push({ path: '/' });
  });

  describe('init', () => {
    const mockStyle = {
      setProperty: vi.fn(),
      removeProperty: vi.fn(),
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      } as unknown as DOMTokenList,
    } as unknown as CSSStyleDeclaration;

    const mockNode = {
      getAttribute: vi.fn(),
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      style: mockStyle,
    } as unknown as HTMLElement;

    const spyRouter = vi.spyOn(GetRouterModule, 'getRouter').mockReturnValue(router);
    const spyLoger = vi.spyOn(Logger.logger, 'warn').mockReturnValue(undefined);

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

    it('should exit, warn and add a data-error attribute if no path or name is found', () => {
      expect.assertions(2);

      render(Active, { router });
      const target = screen.getByTestId('span-error');

      expect(spyLoger).toHaveBeenCalledWith('No path or name found. Make sure you are using the active action with the proper parameters.', {
        node: target,
        options: {},
      });
      expect(target.getAttribute('data-error')).toBe('No path or name found.');
    });
  });

  describe('match', () => {
    describe('data-active', () => {
      const nodes = ['anchor-path', 'anchor-name', 'span-path', 'span-name', 'param-path', 'param-name'];

      it.each(nodes)('should set/unset the data-active attribute on `%s` if the path matches/un-matches', async (node) => {
        expect.assertions(3);

        render(Active, { router });
        const target = screen.getByTestId(node);

        expect(target.getAttribute('data-active')).toBeNull();

        await router.push({ name: HomeRoute.name });

        expect(target.getAttribute('data-active')).toBe('true');

        await router.push({ name: OtherRoute.name });

        expect(target.getAttribute('data-active')).toBeNull();
      });
    });

    it('should set/unset the options class if the path matches/un-matches', async () => {
      expect.assertions(9);

      render(Active, { router });
      const activeClass = screen.getByTestId('anchor-class-active');
      const existingClass = screen.getByTestId('anchor-class-existing');

      expect(activeClass.classList.contains('active')).toBeFalsy();
      expect(existingClass.classList.contains('active')).toBeFalsy();
      expect(existingClass.classList.contains('some-class')).toBeTruthy();

      await router.push({ name: HomeRoute.name });

      expect(activeClass.classList.contains('active')).toBeTruthy();
      expect(existingClass.classList.contains('active')).toBeTruthy();
      expect(existingClass.classList.contains('some-class')).toBeTruthy();

      await router.push({ name: OtherRoute.name });

      expect(activeClass.classList.contains('active')).toBeFalsy();
      expect(existingClass.classList.contains('active')).toBeFalsy();
      expect(existingClass.classList.contains('some-class')).toBeTruthy();
    });

    it('should set/unset the options style if the path matches/un-matches', async () => {
      expect.assertions(9);

      render(Active, { router });
      const activeStyle = screen.getByTestId('anchor-style-active');
      const existingStyle = screen.getByTestId('anchor-style-existing');

      expect(activeStyle.style.color).toBe('');
      expect(existingStyle.style.color).toBe('blue');
      expect(existingStyle.style.fontWeight).toBe('bold');

      await router.push({ name: HomeRoute.name });

      expect(activeStyle.style.color).toBe('red');
      expect(existingStyle.style.color).toBe('red');
      expect(existingStyle.style.fontWeight).toBe('bold');

      await router.push({ name: OtherRoute.name });

      expect(activeStyle.style.color).toBe('');
      expect(existingStyle.style.color).toBe('blue');
      expect(existingStyle.style.fontWeight).toBe('bold');
    });

    it('should only match the exact path when the exact option is true', async () => {
      expect.assertions(6);

      render(Active, { router });
      await router.push({ name: OtherRoute.name });

      const parent = screen.getByTestId('anchor-parent');
      const child = screen.getByTestId('anchor-child');
      const exactParent = screen.getByTestId('anchor-exact-parent');

      expect(parent.getAttribute('data-active')).toBe('true');
      expect(child.getAttribute('data-active')).toBeNull();
      expect(exactParent.getAttribute('data-active')).toBe('true');

      await router.push({ name: TargetRoute.name });

      expect(parent.getAttribute('data-active')).toBe('true');
      expect(child.getAttribute('data-active')).toBe('true');
      expect(exactParent.getAttribute('data-active')).toBeNull();
    });

    it('should match the name case insensitively when the caseSensitive option is false', async () => {
      expect.assertions(4);

      render(Active, { router });

      const sensitive = screen.getByTestId('anchor-name-sensitive');
      const insensitive = screen.getByTestId('anchor-name-insensitive');

      expect(sensitive.getAttribute('data-active')).toBeNull();
      expect(insensitive.getAttribute('data-active')).toBeNull();

      await router.push({ name: OtherRoute.name });

      expect(sensitive.getAttribute('data-active')).toBeNull();
      expect(insensitive.getAttribute('data-active')).toBe('true');
    });
  });
});
