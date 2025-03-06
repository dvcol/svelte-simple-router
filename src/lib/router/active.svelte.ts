import type { Action } from 'svelte/action';

import type { ParsedRoute, RouteName } from '~/models/route.model.js';

import { Matcher } from '~/models/index.js';
import { getRouter } from '~/router/context.svelte.js';
import { Logger } from '~/utils/logger.utils.js';

export type ActiveActionOptions<Name extends RouteName = RouteName> = {
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
};

// recursively extract route.parent.name
const getParentName = (route?: ParsedRoute, names: ParsedRoute['name'][] = []) => {
  if (route?.name) names.push(route.name);
  if (!route?.parent) return names;
  return getParentName(route.parent, names);
};

/**
 * A svelte action to add an active state (class, style or attribute) to an element when the route matches.
 *
 * Additionally:
 * - If attached to an anchor element, it will attempt to match the href attribute.
 * - If path or name options are provided, they will take precedence over the element attributes.
 * - Name always takes precedence over path.
 * - When the route un-matches, the original style will be restored.
 *
 * Note: The action requires the router context to be present in the component tree.
 *
 * @param node - The element to add the active state to
 * @param options - The options to use for the active state
 *
 * @see {@link RouterView}
 *
 * @example
 * ```html
 * <a href="/path" use:active>simple link</a>
 * <a href="/path" data-name="route-name" use:active>named link</a>
 * <button :use:active="{ path: '/path' }">button link</button>
 * <div :use:active="{ name: 'route-name' }">div link</div>
 * ```
 */
export const active: Action<HTMLElement, ActiveActionOptions | undefined> = (node: HTMLElement, options: ActiveActionOptions | undefined = {}) => {
  const router = getRouter();
  if (!router) {
    Logger.warn('Router not found. Make sure you are using the active action within a Router context.', { node, options });
    node.setAttribute('data-error', 'Router not found.');
    return {};
  }

  let _options = $state(options);
  let _path: string | null = $state(_options.path || node.getAttribute('data-path') || node.getAttribute('href'));
  let _name: RouteName | null = $state(_options.name || node.getAttribute('data-name'));

  const update = (newOptions: ActiveActionOptions | undefined = {}) => {
    _options = newOptions;
    _path = newOptions.path || node.getAttribute('data-path') || node.getAttribute('href');
    _name = newOptions.name || node.getAttribute('data-name');

    if (!_path && !_name) {
      Logger.warn('No path or name found. Make sure you are using the active action with the proper parameters.', { node, options });
    }
  };

  if (!_path && !_name) {
    Logger.warn('No path or name found. Make sure you are using the active action with the proper parameters.', { node, options });
    node.setAttribute('data-error', 'No path or name found.');
    return { update };
  }
  node.removeAttribute('data-error');

  const route = $derived(router.route);
  const caseSensitive = $derived(_options?.caseSensitive ?? router.options?.caseSensitive);
  const matchName = $derived.by(() => {
    if (!_name) return false;
    if (!route?.name) return false;
    const names = _options.exact ? [route.name] : getParentName(route);
    if (caseSensitive) return names.includes(_name);
    return names.map(n => String(n)?.toLowerCase()).includes(String(_name)?.toLowerCase());
  });

  const location = $derived(router.location?.path);
  const matcher = $derived(_path ? new Matcher(_path) : undefined);
  const matchPath = $derived.by(() => {
    if (_name) return false;
    if (!matcher) return false;
    if (!location) return false;
    if (_options.exact) return matcher.match(location, true);
    return matcher.match(location);
  });

  const match = $derived(matchName || matchPath);

  const originalStyle = Object.fromEntries(Object.keys(_options.style || {}).map(key => [key, node.style[key as keyof CSSStyleDeclaration]]));

  $effect(() => {
    if (match) {
      node.setAttribute('data-active', 'true');
      if (_options.class) node.classList.add(_options.class);
      if (_options.style) {
        Object.assign(node.style, _options.style);
      }
    } else {
      node.removeAttribute('data-active');
      if (_options.class) node.classList.remove(_options.class);
      if (_options.style) {
        Object.keys(_options.style).forEach(key => node.style.removeProperty(key));
        Object.assign(node.style, originalStyle);
      }
    }
  });

  return { update };
};
