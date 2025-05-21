import type { Action } from 'svelte/action';

import type { RouteName } from '~/models/index.js';
import type { LinkNavigateFunction, LinkNavigateOptions } from '~/models/link.model.js';

import { getLinkNavigateFunction, getResolveFunction, parseBooleanAttribute } from '~/models/link.model.js';
import { Logger } from '~/utils/logger.utils.js';

export type NodeConditionFn = (node: HTMLElement) => boolean;
export interface LinksActionOptions<Name extends RouteName = RouteName, Path extends string = string> {
  /**
   * Whether the target node should be considered a link.
   */
  apply?: NodeConditionFn;
  /**
   * The element to act as a boundary for the upward link search.
   */
  boundary?: HTMLElement | NodeConditionFn;
  /**
   * The navigate options to use for the navigation.
   */
  navigate?: LinkNavigateOptions<Name, Path>;
}

function isLinkNode(node: HTMLElement, apply?: LinksActionOptions['apply']): boolean {
  if (node instanceof HTMLAnchorElement) return true;
  if (parseBooleanAttribute(node, 'router-link')) return true;
  return apply?.(node) ?? false;
}

function isBoundaryNode(node: HTMLElement, boundary: HTMLElement | NodeConditionFn): boolean {
  if (typeof boundary === 'function') return boundary(node);
  return node === boundary;
}

function isWithinBoundary(node: HTMLElement, boundary: HTMLElement | NodeConditionFn): boolean {
  if (isBoundaryNode(node, boundary)) return true;
  let _node: HTMLElement = node;
  while (_node?.parentElement) {
    _node = _node.parentElement;
    if (isBoundaryNode(_node, boundary)) return true;
  }
  return false;
}

type InternalLinksActionOptions = LinksActionOptions & { host: HTMLElement };
function findLinkNode(node: HTMLElement, { apply, boundary, host }: InternalLinksActionOptions): HTMLElement | undefined {
  if (boundary && !isWithinBoundary(node, boundary ?? host)) return;
  if (isLinkNode(node, apply)) return node;
  let link: HTMLElement = node;
  while (link?.parentElement) {
    link = link.parentElement;

    if (isBoundaryNode(link, boundary ?? host)) return;
    if (isLinkNode(link, apply)) return link;
  }
}

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
 * Note: The action requires the router context to be present in the component tree.
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
export const links: Action<HTMLElement, LinksActionOptions | undefined> = (node: HTMLElement, options: LinksActionOptions | undefined = {}) => {
  let _options: InternalLinksActionOptions = $state({ ...options, host: node });
  const update = (newOptions: LinksActionOptions | undefined = {}) => {
    _options = { ...newOptions, host: node };
  };

  const navigate = $derived.by<LinkNavigateFunction | undefined>(() => {
    try {
      const fn = getLinkNavigateFunction(_options.navigate);
      node.removeAttribute('data-error');
      return fn;
    } catch (error) {
      Logger.warn('Router not found. Make sure you are using the link(s) action within a Router context.', { node, options, error });
      node.setAttribute('data-error', 'Router not found.');
    }
  });

  const navigateHandler = async (event: MouseEvent | KeyboardEvent) => {
    const { target } = event;
    if (!(target instanceof HTMLElement)) return;
    if (!navigate) return;

    const nodeLink = findLinkNode(target, _options);
    if (!nodeLink) return;
    return navigate(event, nodeLink);
  };

  // Add resolve on hover option && view params
  const resolve = $derived(getResolveFunction(navigate, _options.navigate));

  const resolveHandler = async (event: FocusEvent | PointerEvent) => {
    const { target } = event;
    if (!(target instanceof HTMLElement)) return;
    if (!resolve) return;

    const nodeLink = findLinkNode(target, _options);
    if (!nodeLink) return;
    return resolve(event, nodeLink);
  };

  node.addEventListener('click', navigateHandler);
  node.addEventListener('keydown', navigateHandler);
  node.addEventListener('pointerover', resolveHandler);
  node.addEventListener('focusin', resolveHandler);
  return {
    update,
    destroy() {
      node.removeEventListener('click', navigateHandler);
      node.removeEventListener('keydown', navigateHandler);
      node.removeEventListener('pointerover', resolveHandler);
      node.removeEventListener('focusin', resolveHandler);
    },
  };
};
