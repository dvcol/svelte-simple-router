import type { Action } from 'svelte/action';

import type { RouteName } from '~/models/index.js';
import type { LinkNavigateFunction, LinkNavigateOptions } from '~/models/link.model.js';

import { resolveComponent } from '@dvcol/svelte-utils/component';

import { getLinkNavigateFunction, normalizeLinkAttributes } from '~/models/link.model.js';
import { getView } from '~/router/context.svelte.js';
import { Logger } from '~/utils/logger.utils.js';

export type LinkActionOptions = LinkNavigateOptions & { resolve?: boolean | string };

/**
 * A svelte action to add to an element to navigate to a new location using the router.
 *
 * The link action will prevent the default behavior and use the router only if the following conditions are met:
 * - The element is within a router context
 * - The event is a left click or enter key
 * - The event does not have a modifier key
 * - The target is not an external link (for anchor elements)
 * - The target is not a new tab or window (for anchor elements)
 *
 * Additionally:
 * - The action merge data-attributes with the options passed as argument.
 * - Passed options have precedence over data-attributes.
 * - If attribute expects a JSON object, it will be parsed.
 * - If a name or path parameter are provided, they will be used to navigate and href will be ignored.
 * - Name takes precedence over path.
 * - If the host is not an anchor element, the role and tabindex attributes will be set.
 *
 * Note: The action requires the router context to be present in the component tree.
 *
 * @param node - The element to add the link action to
 * @param options - The options to use for the navigation
 *
 * @Example
 * ```html
 * <a href="/path/:param?query=value" use:link>simple link</a>
 * <a href='goodbye' name use:link>named link</a>
 * <a href='/path/:param' data-query='{"query":"value"}' use:link>link with query</a>
 * <a href='/path/:param' use:link="{ params: { param: 'value' } }">link with params</a>
 * <div href='/path/:param' use:link="{ params: { param: 'value' } }">div link</div>
 * <button href='/path/:param' use:link="{ params: { param: 'value' } }">button link</button>
 * ```
 */
export const link: Action<HTMLElement, LinkActionOptions | undefined> = (node: HTMLElement, options: LinkActionOptions | undefined = {}) => {
  normalizeLinkAttributes(node, options);

  let _options = $state(options);
  const update = (newOptions: LinkNavigateOptions | undefined = {}) => {
    _options = newOptions;
  };

  const navigate = $derived.by<LinkNavigateFunction | undefined>(() => {
    try {
      return getLinkNavigateFunction(_options);
    } catch (error) {
      Logger.warn('Router not found. Make sure you are using the link(s) action within a Router context.', { node, options, error });
      node.setAttribute('data-error', 'Router not found.');
    }
  });
  if (!navigate) return { update };
  node.removeAttribute('data-error');

  const navigateHandler = async (event: MouseEvent | KeyboardEvent) => navigate?.(event, node);

  // Extract view from context
  const view = getView<RouteName>();

  // Add resolve on hover option && view params
  const resolveHandler = async (event: MouseEvent | KeyboardEvent | FocusEvent | PointerEvent) => {
    const resolve = _options?.resolve;
    if (!resolve || !navigate) return;

    const r = await navigate(event, node, 'resolve');
    if (!r?.route) return;

    // Extract view name
    const name = (typeof resolve === 'string' ? resolve : view?.name) ?? 'default';

    const components = [];
    if (r.route.component) components.push(r.route.component);
    if (r.route.components?.[name]) components.push(r.route.components[name]);
    await Promise.all(components.map(async c => resolveComponent(c)));
  };

  node.addEventListener('click', navigateHandler);
  node.addEventListener('keydown', navigateHandler);
  node.addEventListener('pointerenter', resolveHandler);
  node.addEventListener('focus', resolveHandler);
  return {
    update,
    destroy() {
      node.removeEventListener('click', navigateHandler);
      node.removeEventListener('keydown', navigateHandler);
      node.removeEventListener('pointerenter', resolveHandler);
      node.removeEventListener('focus', resolveHandler);
    },
  };
};
