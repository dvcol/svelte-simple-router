import type { Action } from 'svelte/action';

import type { RouteName } from '~/models/index.js';
import type { LinkNavigateFunction, LinkNavigateOptions } from '~/models/link.model.js';

import { getLinkNavigateFunction, getResolveFunction, normalizeLinkAttributes } from '~/models/link.model.js';
import { Logger } from '~/utils/logger.utils.js';

export type LinkActionOptions<Name extends RouteName = RouteName, Path extends string = string> = LinkNavigateOptions<Name, Path>;

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
      const fn = getLinkNavigateFunction(_options);
      node.removeAttribute('data-error');
      return fn;
    } catch (error) {
      Logger.warn('Router not found. Make sure you are using the link(s) action within a Router context.', { node, options, error });
      node.setAttribute('data-error', 'Router not found.');
    }
  });

  const navigateHandler = async (event: MouseEvent | KeyboardEvent) => navigate?.(event, node);

  // Add resolve on hover option && view params
  const resolve = $derived(getResolveFunction(navigate, _options));

  const resolveHandler = async (event: FocusEvent | PointerEvent) => resolve(event, node);

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
