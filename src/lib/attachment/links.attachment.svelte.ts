import type { Attachment } from 'svelte/attachments';

import type { LinksActionOptions } from '~/models/links.model.js';

import { links } from '~/action/links.action.svelte.js';

/**
 * The `links attachment` intercepts click events on dom elements and upwardly navigate the dom tree until it reaches a link element and triggers a router navigation instead.
 *
 * The links attachment will recognize a parent node as a router link if it satisfies any of the following conditions:
 * - The element is an anchor element
 * - The element has a `data-router-link` attribute
 * - The element satisfies the `apply` selector function passed as argument
 *
 * When a node is recognized as a router link, the attachment will behave as the `link` attachment (all restrictions apply).
 *
 * Additionally:
 * - The attachment requires either valid href or data-attributes to navigate.
 * - Once the attachment reaches the host element or the `boundary` element (or selector function), it will stop evaluating the dom tree.
 *
 * Note: The attachment requires a router instance or the router context to be present in the component tree.
 * Note: Unlike use:link, use:links does not normalize link attributes (role, tabindex, href).
 *
 * @param options
 *
 * @Example
 * ```html
 * <div {@attach useLinks()}>
 *   <div>
 *       <a href="/path/:param?query=value">simple link</a>
 *   </div>
 *   <div data-router-link data-name="Hello">
 *     <span>simple span</span>
 *   </div>
 * </div>
 * ```
 */
export function useLinks(options: LinksActionOptions = {}): Attachment<HTMLElement> {
  return element => links(element, options).destroy;
}
