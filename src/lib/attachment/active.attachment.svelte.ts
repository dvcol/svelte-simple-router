import type { Attachment } from 'svelte/attachments';

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
 * A svelte attachment to add an active state (class, style or attribute) to an element when the route matches.
 *
 * Additionally:
 * - If attached to an anchor element, it will attempt to match the href attribute.
 * - If path or name options are provided, they will take precedence over the element attributes.
 * - Name always takes precedence over path.
 * - When the route un-matches, the original style will be restored.
 *
 * Note: The attachment requires a router instance or the router context to be present in the component tree.
 *
 * @param options - The options to use for the active state
 *
 * @see {@link RouterView}
 *
 * @example
 * ```html
 * <a href="/path" {@attach useActive()}>simple link</a>
 * <a href="/path" data-name="route-name"  {@attach useActive()}>named link</a>
 * <button  {@attach useActive({ path: '/path' })}>button link</button>
 * <div  {@attach useActive({ name: 'route-name' })}>div link</div>
 * ```
 */
export function useActive(options: ActiveOptions = {}): Attachment<HTMLElement> {
  const router = options?.router || getRouter();

  return (element) => {
    if (!ensureActionRouter(element, router)) return;

    const _options = $derived(options);
    const _path: string | null = $derived(options?.path || element.getAttribute('data-path') || element.getAttribute('href'));
    const _name: RouteName | null = $derived(options?.name || element.getAttribute('data-name'));

    const caseSensitive = $derived(_options?.caseSensitive ?? router.options?.caseSensitive);
    const matchName = $derived(doNameMatch(router.route, _name, { caseSensitive, exact: _options?.exact }));

    const location = $derived(router.location?.path);
    const matcher = $derived(_path ? new Matcher(_path) : undefined);
    const matchPath = $derived(doPathMatch(matcher, _name, location, _options?.exact));

    const match = $derived(matchName || matchPath);

    const originalStyle = $derived(getOriginalStyle(element, _options?.style));

    $effect(() => {
      if (match) activeStyles(element, _options);
      else restoreStyles(element, originalStyle, _options);
    });

    $effect(() => {
      ensurePathName(element, { path: _path, name: _name });
    });
  };
}
