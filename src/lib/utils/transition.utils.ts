import { type EasingFunction, scale, type ScaleParams, type TransitionConfig } from 'svelte/transition';

import type { TransitionProps } from '~/models/router.model.js';

interface HeightParams {
  delay?: number;
  duration?: number;
  easing?: EasingFunction;
}

/**
 * Animates the opacity of an element from 0 to the current opacity for `in` transitions and from the current opacity to 0 for `out` transitions.
 */
export function height(node: Element, { delay = 0, duration = 400, easing = x => x }: HeightParams = {}): TransitionConfig {
  const { maxHeight } = getComputedStyle(node);
  const _maxHeight = maxHeight === 'none' ? 0 : parseFloat(maxHeight) / 100;
  return {
    delay,
    duration,
    easing,
    css: t => `max-height: ${t * _maxHeight}px;`,
  };
}

/**
 * Animates the opacity and scale of an element. `in` transitions animate from an element's current (default) values to the provided values, passed as parameters. `out` transitions animate from the provided values to an element's default values.
 */
export function scaleFadeInOut(node: Element, { duration = 400, start = 0.95, ...params }: ScaleParams = {}): TransitionConfig {
  const { css: heightCss } = height(node, { duration, ...params });
  const { delay, easing, css: scaleCss } = scale(node, { duration, start, ...params });

  return {
    delay,
    duration,
    easing,
    css: (t, u) => `
			${scaleCss?.(t, u)};
			${heightCss?.(t, u)};
		`,
  };
}

export const transition: TransitionProps<{ in?: HeightParams; out?: HeightParams }> = {
  skip: true,
  in: scaleFadeInOut,
  out: scaleFadeInOut,
  params: {
    in: { delay: 400 },
  },
};
