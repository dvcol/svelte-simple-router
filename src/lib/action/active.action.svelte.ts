import type { ActionReturn } from 'svelte/action';

import type { ActiveOptions } from '~/models/action.model.js';
import type { RouteName } from '~/models/route.model.js';

import {
  activeStyles,
  doNameMatch,
  doPathMatch,
  ensureActionRouter,
  ensurePathName,
  getOriginalStyle,
  restoreStyles,
} from '~/models/action.model.js';
import { Matcher } from '~/models/index.js';
import { getRouter } from '~/router/context.svelte.js';

/**
 * A svelte action to add an active state (class, style or attribute) to an element when the route matches.
 *
 * Additionally:
 * - If attached to an anchor element, it will attempt to match the href attribute.
 * - If path or name options are provided, they will take precedence over the element attributes.
 * - Name always takes precedence over path.
 * - When the route un-matches, the original style will be restored.
 *
 * Note: The action requires a router instance or the router context to be present in the component tree.
 *
 * @param node - The element to add the active state to
 * @param options - The options to use for the active state
 *
 * @see {@link RouterView}
 *
 * @example
 * ```html
 * <a href="/path" use:active>simple link</a>
 * <a href="/path" data-name="route-name" use:active>named link</a>
 * <button use:active="{ path: '/path' }">button link</button>
 * <div use:active="{ name: 'route-name' }">div link</div>
 * ```
 */
export function active(node: HTMLElement, options: ActiveOptions | undefined = {}): ActionReturn<ActiveOptions | undefined> {
  const router = options?.router || getRouter();
  if (!ensureActionRouter(node, router)) return {};

  let _options = $state(options);
  let _path: string | null = $state(options?.path || node.getAttribute('data-path') || node.getAttribute('href'));
  let _name: RouteName | null = $state(options?.name || node.getAttribute('data-name'));

  const update = (newOptions: ActiveOptions | undefined = {}) => {
    _options = newOptions;
    _path = newOptions?.path || node.getAttribute('data-path') || node.getAttribute('href');
    _name = newOptions?.name || node.getAttribute('data-name');

    ensurePathName(node, { path: _path, name: _name });
  };

  const caseSensitive = $derived(_options?.caseSensitive ?? router.options?.caseSensitive);
  const matchName = $derived(doNameMatch(router.route, _name, { caseSensitive, exact: _options?.exact }));

  const location = $derived(router.location?.path);
  const matcher = $derived(_path ? new Matcher(_path) : undefined);
  const matchPath = $derived(doPathMatch(matcher, _name, location, _options?.exact));

  const match = $derived(matchName || matchPath);

  const originalStyle = $derived(getOriginalStyle(node, _options?.style));

  $effect(() => {
    if (match) activeStyles(node, _options);
    else restoreStyles(node, originalStyle, _options);
  });

  $effect(() => {
    ensurePathName(node, { path: _path, name: _name });
  });
  return { update };
}
