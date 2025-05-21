import type { Matcher } from '~/models/index.js';
import type { ParsedRoute, RouteName } from '~/models/route.model.js';
import type { IRouter } from '~/models/router.model.js';

import { Logger } from '~/utils/logger.utils.js';

export interface ActiveOptions<Name extends RouteName = RouteName> {
  /**
   * Optional router instance to use for matching.
   * If not provided, the router will be extracted from the context.
   */
  router?: IRouter<Name>;
  /**
   * Route name to match against.
   * This takes precedence over the path option.
   */
  name?: Name;
  /**
   * Route path to match against.
   * This is ignored if the name option is provided.
   */
  path?: string;
  /**
   * Inline class to apply when the route is active
   */
  class?: string;
  /**
   * Inline styles to apply when the route is active
   */
  style?: Partial<CSSStyleDeclaration>;
  /**
   * Match the route path exactly
   *
   * @default false
   * @see {@link RouterOptions.strict}
   */
  exact?: boolean;
  /**
   * Coerce the route name to lowercase before comparing.
   * Note: Symbols and numbers will be coerced to strings. Be sure to register your routes names accordingly.
   *
   * @default router if set, else false
   * @see {@link RouterOptions.caseSensitive}
   */
  caseSensitive?: boolean;
}

export function ensureRouter(element: Element, router?: IRouter): router is IRouter {
  if (router) return true;
  Logger.warn('Router not found. Make sure you are using the active action within a Router context.', { element });
  element.setAttribute('data-error', 'Router not found.');
  return false;
}

export function ensurePathName(element: Element, params: { path?: string | null; name?: RouteName | null } = {}): params is { path: string; name: RouteName } {
  if (!params.path && !params.name) {
    Logger.warn('No path or name found. Make sure you are using the active action with the proper parameters.', { element, ...params });
    element.setAttribute('data-error', 'No path or name found.');
    return false;
  }
  element.removeAttribute('data-error');
  return true;
}

// recursively extract route.parent.name
function getParentName(route?: ParsedRoute, names: ParsedRoute['name'][] = []) {
  if (route?.name) names.push(route.name);
  if (!route?.parent) return names;
  return getParentName(route.parent, names);
}

export function doNameMatch(route?: ParsedRoute, name?: RouteName | null, { exact, caseSensitive }: { exact?: boolean; caseSensitive?: boolean } = {}): boolean {
  if (!name) return false;
  if (!route?.name) return false;
  const names = exact ? [route.name] : getParentName(route);
  if (caseSensitive) return names.includes(name);
  return names.map(n => String(n)?.toLowerCase()).includes(String(name)?.toLowerCase());
}

export function doPathMatch(matcher?: Matcher, name?: RouteName | null, location?: string, exact?: boolean): boolean {
  if (name) return false;
  if (!matcher) return false;
  if (!location) return false;
  if (exact) return matcher.match(location, true);
  return matcher.match(location);
}

type Styles = CSSStyleDeclaration[keyof CSSStyleDeclaration];

export function getOriginalStyle(element: Element, style: Partial<CSSStyleDeclaration> = {}): Record<string, Styles> | undefined {
  if (!(element instanceof HTMLElement)) return;
  return Object.fromEntries(Object.keys(style).map(key => [key, element.style[key as keyof CSSStyleDeclaration]]));
}

export function activeStyles(element: Element, options?: ActiveOptions) {
  if (!(element instanceof HTMLElement)) return;
  element.setAttribute('data-active', 'true');
  if (options?.class) element.classList.add(options.class);
  if (!options?.style) return;
  Object.assign(element.style, options.style);
}

export function restoreStyles(element: Element, original?: Record<string, Styles>, options?: ActiveOptions) {
  if (!(element instanceof HTMLElement)) return;
  element.removeAttribute('data-active');
  if (options?.class) element.classList.remove(options.class);
  if (!options?.style) return;
  Object.keys(options.style).forEach(key => element.style.removeProperty(key));
  Object.assign(element.style, original);
}
