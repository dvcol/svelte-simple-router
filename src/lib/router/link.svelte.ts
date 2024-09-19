import type { Action } from 'svelte/action';
import type { CommonRouteNavigation, RouteNavigation } from '~/models/route.model.js';
import type { RouterNavigationOptions } from '~/models/router.model.js';

import { InvalidLinkTargetError } from '~/models/error.model.js';
import { useRouter } from '~/router/use-router.svelte.js';
import { Logger } from '~/utils/logger.utils.js';

const isAnchorTarget = (target: EventTarget | null): target is HTMLAnchorElement => {
  return target instanceof HTMLAnchorElement;
};

const isTargetWithin = (element: HTMLAnchorElement) => {
  return element.target === '' || element.target === '_self';
};

const isNavigationEvent = (event: MouseEvent) =>
  !event.defaultPrevented && event.button === 0 && !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

const isSameHost = (anchor: HTMLAnchorElement, host = window.location.host) => {
  return anchor.host === host || anchor.href.startsWith(`https://${host}`) || anchor.href.indexOf(`http://${host}`) === 0;
};

const parseJsonAttribute = <T = Record<string, any>>(element: HTMLAnchorElement, name: string): T | undefined => {
  const value = element.getAttribute(`data-${name}`);
  if (value === undefined || value === null) return;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    Logger.error(`Failed to parse JSON attribute "${name}" on <a> element`, { element, name, error });
  }
};

const parseBooleanAttribute = (element: HTMLAnchorElement, name: string): boolean | undefined => {
  const value = element.getAttribute(name);
  if (value === undefined || value === null) return;
  return value !== 'false';
};

const addIfFound = <T>(obj: T, key: keyof T, value: T[keyof T]): T => {
  if (value !== undefined) obj[key] = value;
  return obj;
};

export type LinkActionOptions = CommonRouteNavigation & RouterNavigationOptions & { replace?: boolean; name?: string };

/**
 * A link action to add to an anchor element to navigate to a new location using the router.
 *
 * The link action will prevent the default behavior and use the router only if the following conditions are met:
 * - The anchor is within a router context
 * - The target is an anchor element
 * - The target is not an external link
 * - The target is not a new tab or window
 * - The event is a left click
 * - The event does not have a modifier key
 *
 * The action merge data-attributes with the options passed as argument.
 * Passed options have precedence over data-attributes.
 * If attribute expects a JSON object, it will be parsed.
 * If a name is provided, it will be used to navigate and href will be ignored.
 *
 * Example:
 * ```html
 * <a href="/path/:param?query=value" use:link>simple link</a>
 * <a href='goodbye' name use:link>named link</a>
 * ```
 */
export const link: Action<HTMLAnchorElement, LinkActionOptions> = (node: HTMLAnchorElement, options: LinkActionOptions = {}) => {
  if (!isAnchorTarget(node)) throw new InvalidLinkTargetError(node);

  const router = useRouter();
  if (!router) {
    Logger.warn('Router not found. Make sure you are using the link action within a Router context.', { node, options });
    return {};
  }

  const onClick = (event: MouseEvent) => {
    const anchor = event.currentTarget;

    if (!isAnchorTarget(anchor)) return;
    if (!isTargetWithin(anchor)) return;
    if (!isNavigationEvent(event)) return;
    if (!isSameHost(anchor)) return;

    event.preventDefault();

    const replace = options?.replace || parseBooleanAttribute(anchor, 'replace');

    const name = options?.name || anchor.getAttribute('data-name');
    const path = anchor.getAttribute('href') ?? '';

    const navigation: RouteNavigation = name?.length ? { name } : { path };

    // CommonRouteNavigation
    addIfFound(navigation, 'query', options.query ?? parseJsonAttribute(anchor, 'query'));
    addIfFound(navigation, 'params', options.params ?? parseJsonAttribute(anchor, 'params'));
    addIfFound(navigation, 'state', options.state ?? parseJsonAttribute(anchor, 'state'));
    addIfFound(navigation, 'stripQuery', options.stripQuery ?? parseBooleanAttribute(anchor, 'strip-query'));
    addIfFound(navigation, 'stripHash', options.stripQuery ?? parseBooleanAttribute(anchor, 'strip-hash'));
    addIfFound(navigation, 'stripTrailingHash', options.stripQuery ?? parseBooleanAttribute(anchor, 'strip-trailing-hash'));

    const navigationOptions: RouterNavigationOptions = {};

    // RouterNavigationOptions
    addIfFound(navigationOptions, 'base', options.base ?? (anchor.getAttribute('base') || undefined));
    addIfFound(navigationOptions, 'hash', options.hash ?? parseBooleanAttribute(anchor, 'hash'));
    addIfFound(navigationOptions, 'strict', options.strict ?? parseBooleanAttribute(anchor, 'strict'));
    addIfFound(navigationOptions, 'failOnNotFound', options.failOnNotFound ?? parseBooleanAttribute(anchor, 'fail-on-not-found'));
    addIfFound(navigationOptions, 'metaAsState', options.metaAsState ?? parseBooleanAttribute(anchor, 'meta-as-state'));
    addIfFound(navigationOptions, 'nameAsTitle', options.nameAsTitle ?? parseBooleanAttribute(anchor, 'name-as-title'));
    addIfFound(navigationOptions, 'followGuardRedirects', options.followGuardRedirects ?? parseBooleanAttribute(anchor, 'follow-guard-redirects'));

    console.info('navigation', navigation, options);

    return router[replace ? 'replace' : 'push'](navigation, navigationOptions);
  };

  node.addEventListener('click', onClick);
  return {
    destroy() {
      node.removeEventListener('click', onClick);
    },
  };
};
