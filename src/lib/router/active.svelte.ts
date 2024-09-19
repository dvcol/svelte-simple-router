import type { Action } from 'svelte/action';

import type { ParsedRoute } from '~/models/route.model.js';

import { useRouter } from '~/router/use-router.svelte.js';
import { Logger } from '~/utils/logger.utils.js';

export type ActiveActionOptions = {
  /**
   * Route name to match against.
   * This takes precedence over the path option.
   */
  name?: string;
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
  style?: CSSStyleDeclaration;
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
   * @default false
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
 * If attached to an anchor element, it will attempt to match the href attribute.
 * If path or name options are provided, they will take precedence over the element attributes.
 * Name always takes precedence over path.
 *
 * When the route un-matches, the original style will be restored.
 *
 * Requires the `Router` context to be available.
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
export const active: Action<HTMLElement, ActiveActionOptions> = (node: HTMLElement, options: ActiveActionOptions) => {
  const router = useRouter();
  if (!router) {
    Logger.warn('Router not found. Make sure you are using the active action within a Router context.', { node, options });
    return {};
  }

  const _path: string | null = options.path || node.getAttribute('data-path') || node.getAttribute('href');
  const _name: string | null = options.name || node.getAttribute('data-name');

  if (!_path && !_name) {
    Logger.warn('No path or name found. Make sure you are using the active action with the proper parameters.', { node, options });
    return;
  }

  const route = $derived(router.route);
  const match = $derived.by(() => {
    if (_name) {
      if (!route?.name) return false;
      const names = options.exact ? [route.name] : getParentName(route);
      if (options.caseSensitive) return names.includes(_name);
      return names.map(n => String(n)?.toLowerCase()).includes(_name?.toLowerCase());
    }
    if (!_path) return false;
    if (!route?.matcher) return false;
    if (options.exact) return route.matcher.match(_path, true);
    return route.matcher.match(_path);
  });

  const originalStyle = Object.fromEntries(Object.keys(options.style || {}).map(key => [key, node.style[key as keyof CSSStyleDeclaration]]));

  $effect(() => {
    if (match) {
      node.setAttribute('data-active', 'true');
      if (options.class) node.classList.add(options.class);
      if (options.style) {
        Object.assign(node.style, options.style);
      }
    } else {
      node.removeAttribute('data-active');
      if (options.class) node.classList.remove(options.class);
      if (options.style) {
        Object.keys(options.style).forEach(key => node.style.removeProperty(key));
        Object.assign(node.style, originalStyle);
      }
    }
  });
};
