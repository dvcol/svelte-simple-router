import type { CommonRouteNavigation, ResolvedRoute, RouteName, RouteNavigation } from '~/models/route.model.js';
import type { ResolvedRouterLocationSnapshot, RouterNavigationOptions } from '~/models/router.model.js';

import { MissingRouterContextError, NavigationCancelledError } from '~/models/index.js';
import { getRouter } from '~/router/context.svelte.js';
import { Logger, LoggerKey } from '~/utils/logger.utils.js';

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

const parseJsonAttribute = <T = Record<string, any>>(element: HTMLElement, name: string, prefix = 'data'): T | undefined => {
  const value = element.getAttribute([prefix, name].join('-'));
  if (value === undefined || value === null) return;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    Logger.error(`Failed to parse JSON attribute "${name}" on <a> element`, { element, name, error });
    element.setAttribute('data-error', `Failed to parse JSON attribute "${name}"`);
  }
};

export const parseBooleanAttribute = (element: HTMLElement, name: string, prefix = 'data'): boolean | undefined => {
  const value = element.getAttribute([prefix, name].join('-'));
  if (value === undefined || value === null) return;
  return value !== 'false';
};

const addIfFound = <T>(obj: T, key: keyof T, value: T[keyof T]): T => {
  if (value !== undefined) obj[key] = value;
  return obj;
};

const isMouseOrKeyboardEvent = (event: Event): event is MouseEvent | KeyboardEvent => event instanceof MouseEvent || event instanceof KeyboardEvent;

const isNotValidAnchorNavigation = (event: Event) => {
  // If the event is not a mouse or keyboard event, we ignore it
  if (!isMouseOrKeyboardEvent(event)) return false;
  const anchor = event.currentTarget;

  // if the event is not a valid navigation event (left click or enter, no modifier keys), we return
  if (!isNavigationEvent(event)) return true;
  // if the target is not an anchor element, we skip target and host checks
  if (!isAnchorTarget(anchor)) return false;
  if (!isTargetWithin(anchor)) return true;
  return !isSameHost(anchor);
};

export type LinkNavigateFunction = <Action extends 'replace' | 'push' | 'resolve'>(
  event: MouseEvent | KeyboardEvent | FocusEvent,
  node: HTMLElement & { disabled?: boolean },
  action?: Action,
) => Promise<Action extends 'resolve' ? ResolvedRoute | undefined : ResolvedRouterLocationSnapshot | undefined>;

/**
 * Get the router link navigation function for the given options.
 * @param options
 *
 * @throws {MissingRouterContextError} - If the router context is not found
 */
export const getLinkNavigateFunction = (options: LinkNavigateOptions = {}): LinkNavigateFunction => {
  const router = getRouter();
  if (!router) throw new MissingRouterContextError();

  return async (event, node, action) => {
    // if the element is disabled, we return
    if (options?.disabled) return;
    if ('disabled' in node && node.disabled) return;
    const disabled = node.getAttribute('disabled');
    if (disabled === '' || disabled === 'true') return;
    // if the target is an anchor element and the event is not a valid navigation event, we return
    if (isNotValidAnchorNavigation(event)) return;

    event.preventDefault();

    let _action: 'replace' | 'push' | 'resolve' = action ?? 'push';
    if (!action && (options?.replace || parseBooleanAttribute(node, 'replace'))) _action = 'replace';

    const name = options?.name || node.getAttribute('data-name');
    const path = (options?.path || node.getAttribute('data-path') || node.getAttribute('href')) ?? '';

    const navigation: RouteNavigation = name ? { name } : { path };

    // CommonRouteNavigation
    addIfFound(navigation, 'query', options.query ?? parseJsonAttribute(node, 'query'));
    addIfFound(navigation, 'params', options.params ?? parseJsonAttribute(node, 'params'));
    addIfFound(navigation, 'state', options.state ?? parseJsonAttribute(node, 'state'));
    addIfFound(navigation, 'stripQuery', options.stripQuery ?? parseBooleanAttribute(node, 'strip-query'));
    addIfFound(navigation, 'stripHash', options.stripHash ?? parseBooleanAttribute(node, 'strip-hash'));
    addIfFound(navigation, 'stripTrailingHash', options.stripTrailingHash ?? parseBooleanAttribute(node, 'strip-trailing-hash'));

    const navigationOptions: RouterNavigationOptions = {};

    // RouterNavigationOptions
    addIfFound(navigationOptions, 'base', options.base ?? (node.getAttribute('data-base') || undefined));
    addIfFound(navigationOptions, 'hash', options.hash ?? parseBooleanAttribute(node, 'hash'));
    addIfFound(navigationOptions, 'strict', options.strict ?? parseBooleanAttribute(node, 'strict'));
    addIfFound(navigationOptions, 'force', options.force ?? parseBooleanAttribute(node, 'force'));
    addIfFound(navigationOptions, 'failOnNotFound', options.failOnNotFound ?? parseBooleanAttribute(node, 'fail-on-not-found'));
    addIfFound(navigationOptions, 'metaAsState', options.metaAsState ?? parseBooleanAttribute(node, 'meta-as-state'));
    addIfFound(navigationOptions, 'nameAsTitle', options.nameAsTitle ?? parseBooleanAttribute(node, 'name-as-title'));
    addIfFound(navigationOptions, 'followGuardRedirects', options.followGuardRedirects ?? parseBooleanAttribute(node, 'follow-guard-redirects'));

    try {
      return (await router[_action](navigation, navigationOptions)) as Promise<
        typeof action extends 'resolve' ? ResolvedRoute | undefined : ResolvedRouterLocationSnapshot | undefined
      >;
    } catch (error) {
      if (error instanceof NavigationCancelledError) {
        Logger.warn(`[${LoggerKey} Link - ${router.id}] Navigation cancelled`, { node, error, navigation, navigationOptions });
      } else {
        Logger.error(`[${LoggerKey} Link - ${router.id}] Failed to ${_action} state`, { node, error, navigation, navigationOptions });
      }
    }
  };
};

/**
 * Normalize the link attributes and options.
 * If the host is not an anchor element, the role and tabindex attributes will be set.
 * If the host is missing an href attribute and a path is provided, the path will be set as the href.
 *
 * @param node
 * @param options
 */
export const normalizeLinkAttributes = (node: HTMLElement, options: LinkNavigateOptions) => {
  if (!isAnchorTarget(node)) {
    if (!node.hasAttribute('role')) node.setAttribute('role', 'link');
    if (!node.hasAttribute('tabindex')) node.setAttribute('tabindex', '0');
  } else if (!node.hasAttribute('href') && options?.path) {
    node.setAttribute('href', options.path);
  }
  return { node, options };
};

export type LinkNavigateOptions<Name extends RouteName = RouteName> = CommonRouteNavigation &
  RouterNavigationOptions & { replace?: boolean; name?: Name; path?: string; disabled?: boolean };
