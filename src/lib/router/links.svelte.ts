import type { Action } from 'svelte/action';

import { getLinkNavigateFunction, type LinkNavigateFunction, parseBooleanAttribute } from '~/models/link.model.js';
import { Logger } from '~/utils/logger.utils.js';

export type NodeConditionFn = (node: HTMLElement) => boolean;
export type LinksActionOptions = {
  apply?: NodeConditionFn;
  boundary?: HTMLElement | NodeConditionFn;
};

const isLinkNode = (node: HTMLElement, apply?: LinksActionOptions['apply']): boolean => {
  if (node instanceof HTMLAnchorElement) return true;
  if (parseBooleanAttribute(node, 'router-link')) return true;
  return apply?.(node) ?? false;
};

const isBoundaryNode = (node: HTMLElement, boundary: HTMLElement | NodeConditionFn): boolean => {
  if (typeof boundary === 'function') return boundary(node);
  return node === boundary;
};

const isWithinBoundary = (node: HTMLElement, boundary: HTMLElement | NodeConditionFn): boolean => {
  if (isBoundaryNode(node, boundary)) return true;
  let _node: HTMLElement = node;
  while (_node?.parentElement) {
    _node = _node.parentElement;
    if (isBoundaryNode(_node, boundary)) return true;
  }
  return false;
};

type InternalLinksActionOptions = LinksActionOptions & { host: HTMLElement };
const findLinkNode = (node: HTMLElement, { apply, boundary, host }: InternalLinksActionOptions): HTMLElement | undefined => {
  if (boundary && !isWithinBoundary(node, boundary ?? host)) return;
  if (isLinkNode(node, apply)) return node;
  let link: HTMLElement = node;
  while (link?.parentElement) {
    link = link.parentElement;

    if (isBoundaryNode(link, boundary ?? host)) return;
    if (isLinkNode(link, apply)) return link;
  }
};

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
  let _options: InternalLinksActionOptions = { ...options, host: node };

  let navigate: LinkNavigateFunction;
  try {
    navigate = getLinkNavigateFunction();
  } catch (error) {
    Logger.warn('Router not found. Make sure you are using the link(s) action within a Router context.', { node, options });
    node.setAttribute('data-error', 'Router not found.');
    return {};
  }

  const handler = (event: MouseEvent | KeyboardEvent) => {
    const { target } = event;
    if (!(target instanceof HTMLElement)) return;

    const nodeLink = findLinkNode(target, _options);
    if (!nodeLink) return;
    return navigate(event, nodeLink);
  };

  node.addEventListener('click', handler);
  node.addEventListener('keydown', handler);
  return {
    update(newOptions: LinksActionOptions | undefined = {}) {
      _options = { ...newOptions, host: node };
    },
    destroy() {
      node.removeEventListener('click', handler);
      node.removeEventListener('keydown', handler);
    },
  };
};
