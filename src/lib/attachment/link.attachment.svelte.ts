import type { Attachment } from 'svelte/attachments';

import type { LinkNavigateFunction, LinkNavigateOptions } from '~/models/link.model.js';

import { ensureLinkRouter, getNavigateFunction, getResolveFunction, normalizeLinkAttributes } from '~/models/link.model.js';
import { getRouter } from '~/router/context.svelte.js';

/**
 * A svelte attachment to add to an element to navigate to a new location using the router.
 *
 * The link attachment will prevent the default behavior and use the router only if the following conditions are met:
 * - The element is within a router context
 * - The event is a left click or enter key
 * - The event does not have a modifier key
 * - The target is not an external link (for anchor elements)
 * - The target is not a new tab or window (for anchor elements)
 *
 * Additionally:
 * - The attachment merge data-attributes with the options passed as argument.
 * - Passed options have precedence over data-attributes.
 * - If attribute expects a JSON object, it will be parsed.
 * - If a name or path parameter are provided, they will be used to navigate and href will be ignored.
 * - Name takes precedence over path.
 * - If the host is not an anchor element, the role and tabindex attributes will be set.
 *
 * Note: The attachment requires a router instance or the router context to be present in the component tree.
 *
 * @param options - The options to use for the navigation
 *
 * @Example
 * ```html
 * <a href="/path/:param?query=value" {@attach useLink()}>simple link</a>
 * <a href='goodbye' name {@attach useLink()}>named link</a>
 * <a href='/path/:param' data-query='{"query":"value"}' {@attach useLink()}>link with query</a>
 * <a href='/path/:param' {@attach useLink({ params: { param: 'value' } })}>link with params</a>
 * <div href='/path/:param' {@attach useLink({ params: { param: 'value' } })}>div link</div>
 * <button href='/path/:param' {@attach useLink({ params: { param: 'value' } })}>button link</button>
 * ```
 */
export function useLink(options: LinkNavigateOptions = {}): Attachment<HTMLElement> {
  return (element) => {
    const _options = $state(normalizeLinkAttributes(element, options));

    const router = _options?.router || getRouter();
    if (!ensureLinkRouter(element, router)) return;

    const navigate = $derived<LinkNavigateFunction | undefined>(getNavigateFunction(router, options));
    const navigateHandler = async (event: MouseEvent | KeyboardEvent) => navigate?.(event, element);

    const resolve = $derived(getResolveFunction(navigate, _options));
    const resolveHandler = async (event: FocusEvent | PointerEvent) => resolve(event, element);

    element.addEventListener('click', navigateHandler);
    element.addEventListener('keydown', navigateHandler);
    element.addEventListener('pointerenter', resolveHandler);
    element.addEventListener('focus', resolveHandler);
    return () => {
      element.removeEventListener('click', navigateHandler);
      element.removeEventListener('keydown', navigateHandler);
      element.removeEventListener('pointerenter', resolveHandler);
      element.removeEventListener('focus', resolveHandler);
    };
  };
}
