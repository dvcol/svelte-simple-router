import type { LinkNavigateFunction, LinkNavigateOptions, LinkResolveFunction } from '~/models/link.model.js';
import type { RouteName } from '~/models/route.model.js';

import { parseBooleanAttribute } from '~/models/link.model.js';

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

export type InternalLinksActionOptions = LinksActionOptions & { host: HTMLElement };
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

export function getNavigateHandler(options: InternalLinksActionOptions, navigate?: LinkNavigateFunction) {
  return async (event: MouseEvent | KeyboardEvent) => {
    const { target } = event;
    if (!(target instanceof HTMLElement)) return;
    if (!navigate) return;

    const nodeLink = findLinkNode(target, options);
    if (!nodeLink) return;
    return navigate(event, nodeLink);
  };
}

export function getResolveHandler(options: InternalLinksActionOptions, resolve?: LinkResolveFunction) {
  return async (event: FocusEvent | PointerEvent) => {
    const { target } = event;
    if (!(target instanceof HTMLElement)) return;
    if (!resolve) return;

    const nodeLink = findLinkNode(target, options);
    if (!nodeLink) return;
    return resolve(event, nodeLink);
  };
}
