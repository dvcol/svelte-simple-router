import type { Attachment } from 'svelte/attachments';

import type { ActiveOptions } from '~/models/action.model.js';
import type { RouteName } from '~/models/route.model.js';

import { activeStyles, doNameMatch, doPathMatch, ensurePathName, ensureRouter, getOriginalStyle, restoreStyles } from '~/models/action.model.js';
import { Matcher } from '~/models/index.js';
import { getRouter } from '~/router/context.svelte.js';

export function useActive(options: ActiveOptions): Attachment {
  const router = getRouter();

  return (element) => {
    if (!ensureRouter(element, router)) return;

    const _options = $derived(options);
    const _path: string | null = $derived(options?.path || element.getAttribute('data-path') || element.getAttribute('href'));
    const _name: RouteName | null = $derived(options?.name || element.getAttribute('data-name'));

    const caseSensitive = $derived(_options?.caseSensitive ?? router.options?.caseSensitive);
    const matchName = $derived(doNameMatch(router.route, _name, { caseSensitive, exact: _options?.exact }));

    const location = $derived(router.location?.path);
    const matcher = $derived(_path ? new Matcher(_path) : undefined);
    const matchPath = $derived(doPathMatch(matcher, _name, location, _options?.exact));

    const match = $derived(matchName || matchPath);

    const originalStyle = $derived(getOriginalStyle(element, _options?.style));

    $effect(() => {
      if (match) activeStyles(element, _options);
      else restoreStyles(element, originalStyle, _options);
    });

    $effect(() => {
      ensurePathName(element, { path: _path, name: _name });
    });
  };
}
