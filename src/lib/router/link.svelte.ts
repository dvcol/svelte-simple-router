import type { Action } from 'svelte/action';
import type { CommonRouteNavigation, RouteNavigation } from '~/models/route.model.js';
import type { RouterNavigationOptions } from '~/models/router.model.js';

import { useRouter } from '~/router/use-router.svelte.js';
import { Logger } from '~/utils/logger.utils.js';

const isAnchorTarget = (target: EventTarget | null): target is HTMLAnchorElement => {
  return target instanceof HTMLAnchorElement;
};

const isTargetWithin = (element: HTMLAnchorElement) => {
  return element.target === '' || element.target === '_self';
};

const isNavigationEvent = (event: MouseEvent | KeyboardEvent) => {
  if (event.defaultPrevented) return false;
  if (event instanceof MouseEvent && event.button !== 0) return false;
  if (event instanceof KeyboardEvent && event.key !== 'Enter') return false;
  return !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
};

const isSameHost = (anchor: HTMLAnchorElement, host = window.location.host) => {
  return anchor.host === host || anchor.href.startsWith(`https://${host}`) || anchor.href.indexOf(`http://${host}`) === 0;
};

const parseJsonAttribute = <T = Record<string, any>>(element: HTMLElement, name: string): T | undefined => {
  const value = element.getAttribute(`data-${name}`);
  if (value === undefined || value === null) return;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    Logger.error(`Failed to parse JSON attribute "${name}" on <a> element`, { element, name, error });
  }
};

const parseBooleanAttribute = (element: HTMLElement, name: string): boolean | undefined => {
  const value = element.getAttribute(name);
  if (value === undefined || value === null) return;
  return value !== 'false';
};

const addIfFound = <T>(obj: T, key: keyof T, value: T[keyof T]): T => {
  if (value !== undefined) obj[key] = value;
  return obj;
};

const isNotValidAnchorNavigation = (event: MouseEvent | KeyboardEvent) => {
  const anchor = event.currentTarget;

  // if the event is not a valid navigation event (left click or enter, no modifier keys), we return
  if (!isNavigationEvent(event)) return true;
  // if the target is not an anchor element, we skip target and host checks
  if (!isAnchorTarget(anchor)) return false;
  if (!isTargetWithin(anchor)) return true;
  return !isSameHost(anchor);
};

export type LinkActionOptions = CommonRouteNavigation & RouterNavigationOptions & { replace?: boolean; name?: string; path?: string };

/**
 * A link action to add to an element to navigate to a new location using the router.
 *
 * The link action will prevent the default behavior and use the router only if the following conditions are met:
 * - The element is within a router context
 * - The event is a left click or enter key
 * - The event does not have a modifier key
 * - The target is not an external link (for anchor elements)
 * - The target is not a new tab or window (for anchor elements)
 *
 * The action merge data-attributes with the options passed as argument.
 * Passed options have precedence over data-attributes.
 * If attribute expects a JSON object, it will be parsed.
 * If a name or path parameter are provided, they will be used to navigate and href will be ignored.
 * Name takes precedence over path.
 *
 * If the host is not an anchor element, the role and tabindex attributes will be set.
 *
 * Example:
 * ```html
 * <a href="/path/:param?query=value" use:link>simple link</a>
 * <a href='goodbye' name use:link>named link</a>
 * <a href='/path/:param' data-query='{"query":"value"}' use:link>link with query</a>
 * <a href='/path/:param' use:link="{ params: { param: 'value' } }">link with params</a>
 * <div href='/path/:param' use:link="{ params: { param: 'value' } }">div link</div>
 * <button href='/path/:param' use:link="{ params: { param: 'value' } }">button link</button>
 * ```
 */
export const link: Action<HTMLElement, LinkActionOptions> = (node: HTMLElement, options: LinkActionOptions = {}) => {
  if (!isAnchorTarget(node)) {
    if (!node.hasAttribute('role')) node.setAttribute('role', 'link');
    if (!node.hasAttribute('tabindex')) node.setAttribute('tabindex', '0');
  }

  const router = useRouter();
  if (!router) {
    Logger.warn('Router not found. Make sure you are using the link action within a Router context.', { node, options });
    return {};
  }

  const navigate = (event: MouseEvent | KeyboardEvent) => {
    // if the target is an anchor element and the event is not a valid navigation event, we return
    if (isNotValidAnchorNavigation(event)) return;

    event.preventDefault();

    const replace = options?.replace || parseBooleanAttribute(node, 'replace');

    const name = options?.name || node.getAttribute('data-name');
    const path = (options?.path || node.getAttribute('data-path') || node.getAttribute('href')) ?? '';

    const navigation: RouteNavigation = name?.length ? { name } : { path };

    // CommonRouteNavigation
    addIfFound(navigation, 'query', options.query ?? parseJsonAttribute(node, 'query'));
    addIfFound(navigation, 'params', options.params ?? parseJsonAttribute(node, 'params'));
    addIfFound(navigation, 'state', options.state ?? parseJsonAttribute(node, 'state'));
    addIfFound(navigation, 'stripQuery', options.stripQuery ?? parseBooleanAttribute(node, 'strip-query'));
    addIfFound(navigation, 'stripHash', options.stripQuery ?? parseBooleanAttribute(node, 'strip-hash'));
    addIfFound(navigation, 'stripTrailingHash', options.stripQuery ?? parseBooleanAttribute(node, 'strip-trailing-hash'));

    const navigationOptions: RouterNavigationOptions = {};

    // RouterNavigationOptions
    addIfFound(navigationOptions, 'base', options.base ?? (node.getAttribute('base') || undefined));
    addIfFound(navigationOptions, 'hash', options.hash ?? parseBooleanAttribute(node, 'hash'));
    addIfFound(navigationOptions, 'strict', options.strict ?? parseBooleanAttribute(node, 'strict'));
    addIfFound(navigationOptions, 'failOnNotFound', options.failOnNotFound ?? parseBooleanAttribute(node, 'fail-on-not-found'));
    addIfFound(navigationOptions, 'metaAsState', options.metaAsState ?? parseBooleanAttribute(node, 'meta-as-state'));
    addIfFound(navigationOptions, 'nameAsTitle', options.nameAsTitle ?? parseBooleanAttribute(node, 'name-as-title'));
    addIfFound(navigationOptions, 'followGuardRedirects', options.followGuardRedirects ?? parseBooleanAttribute(node, 'follow-guard-redirects'));

    console.info('navigation', navigation, options);

    return router[replace ? 'replace' : 'push'](navigation, navigationOptions);
  };

  node.addEventListener('click', navigate);
  node.addEventListener('keydown', navigate);
  return {
    destroy() {
      node.removeEventListener('click', navigate);
      node.removeEventListener('keydown', navigate);
    },
  };
};
