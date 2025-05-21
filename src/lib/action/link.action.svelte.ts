import type { ActionReturn } from 'svelte/action';

import type { LinkNavigateFunction, LinkNavigateOptions } from '~/models/link.model.js';

import { ensureLinkRouter, getNavigateFunction, getResolveFunction, normalizeLinkAttributes } from '~/models/link.model.js';
import { getRouter } from '~/router/context.svelte.js';

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
 * Note: The action requires a router instance or the router context to be present in the component tree.
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
export function link(node: HTMLElement, options: LinkNavigateOptions | undefined = {}): ActionReturn<LinkNavigateOptions | undefined> {
  const router = options?.router || getRouter();
  if (!ensureLinkRouter(node, router)) return {};

  let _options = $state(normalizeLinkAttributes(node, options));

  const navigate = $derived<LinkNavigateFunction | undefined>(getNavigateFunction(router, options));
  const navigateHandler = async (event: MouseEvent | KeyboardEvent) => navigate?.(event, node);

  const resolve = $derived(getResolveFunction(navigate, _options));
  const resolveHandler = async (event: FocusEvent | PointerEvent) => resolve(event, node);

  node.addEventListener('click', navigateHandler);
  node.addEventListener('keydown', navigateHandler);
  node.addEventListener('pointerenter', resolveHandler);
  node.addEventListener('focus', resolveHandler);
  return {
    update(newOptions: LinkNavigateOptions | undefined = {}) {
      _options = newOptions;
    },
    destroy() {
      node.removeEventListener('click', navigateHandler);
      node.removeEventListener('keydown', navigateHandler);
      node.removeEventListener('pointerenter', resolveHandler);
      node.removeEventListener('focus', resolveHandler);
    },
  };
};
