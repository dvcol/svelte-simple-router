import type { Attachment } from 'svelte/attachments';

import type { ActiveOptions } from '~/models/action.model.js';

import { active } from '~/action/index.js';

/**
 * A svelte attachment to add an active state (class, style or attribute) to an element when the route matches.
 *
 * Additionally:
 * - If attached to an anchor element, it will attempt to match the href attribute.
 * - If path or name options are provided, they will take precedence over the element attributes.
 * - Name always takes precedence over path.
 * - When the route un-matches, the original style will be restored.
 *
 * Note: The attachment requires a router instance or the router context to be present in the component tree.
 *
 * @param options - The options to use for the active state
 *
 * @see {@link RouterView}
 *
 * @example
 * ```html
 * <a href="/path" {@attach useActive()}>simple link</a>
 * <a href="/path" data-name="route-name"  {@attach useActive()}>named link</a>
 * <button  {@attach useActive({ path: '/path' })}>button link</button>
 * <div  {@attach useActive({ name: 'route-name' })}>div link</div>
 * ```
 */
export function useActive(options: ActiveOptions = {}): Attachment<HTMLElement> {
  return element => active(element, options).destroy;
}
