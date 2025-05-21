import type { ActionReturn } from 'svelte/action';

import type { LinkNavigateFunction } from '~/models/link.model.js';
import type { InternalLinksActionOptions, LinksActionOptions } from '~/models/links.model.js';

import { ensureLinkRouter, getNavigateFunction, getResolveFunction } from '~/models/link.model.js';
import { getNavigateHandler, getResolveHandler } from '~/models/links.model.js';
import { getRouter } from '~/router/context.svelte.js';

/**
 * The `links action` intercepts click events on dom elements and upwardly navigate the dom tree until it reaches a link element and triggers a router navigation instead.
 *
 * The links action will recognize a parent node as a router link if it satisfies any of the following conditions:
 * - The element is an anchor element
 * - The element has a `data-router-link` attribute
 * - The element satisfies the `apply` selector function passed as argument
 *
 * When a node is recognized as a router link, the action will behave as the `link` action (all restrictions apply).
 *
 * Additionally:
 * - The action requires either valid href or data-attributes to navigate.
 * - Once the action reaches the host element or the `boundary` element (or selector function), it will stop evaluating the dom tree.
 *
 * Note: The action requires a router instance or the router context to be present in the component tree.
 * Note: Unlike use:link, use:links does not normalize link attributes (role, tabindex, href).
 *
 * @param node
 * @param options
 *
 * @Example
 * ```html
 * <div use:links>
 *   <div>
 *       <a href="/path/:param?query=value">simple link</a>
 *   </div>
 *   <div data-router-link data-name="Hello">
 *     <span>simple span</span>
 *   </div>
 * </div>
 * ```
 */
export function links(node: HTMLElement, options: LinksActionOptions | undefined = {}): ActionReturn<LinksActionOptions | undefined> {
  const router = options?.navigate?.router || getRouter();
  if (!ensureLinkRouter(node, router)) return {};

  let _options: InternalLinksActionOptions = $derived({ ...options, host: node });

  const navigate = $derived<LinkNavigateFunction | undefined>(getNavigateFunction(router, _options.navigate));
  const navigateHandler = getNavigateHandler(_options, navigate);

  const resolve = $derived(getResolveFunction(navigate, _options.navigate));
  const resolveHandler = getResolveHandler(_options, resolve);

  node.addEventListener('click', navigateHandler);
  node.addEventListener('keydown', navigateHandler);
  node.addEventListener('pointerover', resolveHandler);
  node.addEventListener('focusin', resolveHandler);
  return {
    update(newOptions: LinksActionOptions | undefined = {}) {
      _options = { ...newOptions, host: node };
    },
    destroy() {
      node.removeEventListener('click', navigateHandler);
      node.removeEventListener('keydown', navigateHandler);
      node.removeEventListener('pointerover', resolveHandler);
      node.removeEventListener('focusin', resolveHandler);
    },
  };
};
