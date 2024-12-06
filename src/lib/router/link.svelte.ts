import type { Action } from 'svelte/action';

import { getLinkNavigateFunction, type LinkActionOptions, type LinkNavigateFunction, normalizeLinkAttributes } from '~/models/link.model.js';
import { Logger } from '~/utils/logger.utils.js';

/**
 * A svelte action to add to an element to navigate to a new location using the router.
 *
 * The link action will prevent the default behavior and use the router only if the following conditions are met:
 * - The element is within a router context
 * - The event is a left click or enter key
 * - The event does not have a modifier key
 * - The target is not an external link (for anchor elements)
 * - The target is not a new tab or window (for anchor elements)
 *
 * Additionally:
 * - The action merge data-attributes with the options passed as argument.
 * - Passed options have precedence over data-attributes.
 * - If attribute expects a JSON object, it will be parsed.
 * - If a name or path parameter are provided, they will be used to navigate and href will be ignored.
 * - Name takes precedence over path.
 * - If the host is not an anchor element, the role and tabindex attributes will be set.
 *
 * Note: The action requires the router context to be present in the component tree.
 *
 * @param node - The element to add the link action to
 * @param options - The options to use for the navigation
 *
 * @Example
 * ```html
 * <a href="/path/:param?query=value" use:link>simple link</a>
 * <a href='goodbye' name use:link>named link</a>
 * <a href='/path/:param' data-query='{"query":"value"}' use:link>link with query</a>
 * <a href='/path/:param' use:link="{ params: { param: 'value' } }">link with params</a>
 * <div href='/path/:param' use:link="{ params: { param: 'value' } }">div link</div>
 * <button href='/path/:param' use:link="{ params: { param: 'value' } }">button link</button>
 * ```
 */
export const link: Action<HTMLElement, LinkActionOptions | undefined> = (node: HTMLElement, options: LinkActionOptions | undefined = {}) => {
  normalizeLinkAttributes(node, options);

  let _options = options;

  let navigate: LinkNavigateFunction;
  try {
    navigate = getLinkNavigateFunction(_options);
  } catch (error) {
    Logger.warn('Router not found. Make sure you are using the link(s) action within a Router context.', { node, options });
    node.setAttribute('data-error', 'Router not found.');
    return {};
  }

  const handler = (event: MouseEvent | KeyboardEvent) => navigate(event, node);

  node.addEventListener('click', handler);
  node.addEventListener('keydown', handler);
  return {
    update(newOptions: LinkActionOptions | undefined = {}) {
      _options = newOptions;
    },
    destroy() {
      node.removeEventListener('click', handler);
      node.removeEventListener('keydown', handler);
    },
  };
};
