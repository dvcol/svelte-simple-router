import { type EasingFunction, scale, type ScaleParams, type TransitionConfig } from 'svelte/transition';

import type { TransitionProps } from '~/models/router.model.js';

export interface BaseParams {
  delay?: number;
  duration?: number;
  easing?: EasingFunction;
}

export interface FreezeParams {
  /**
   * If `true`, the element size will be frozen during the transition.
   */
  freeze?: boolean;
}

export type HeightParams = BaseParams & FreezeParams;

/**
 * Animates the height of an element from 0 to the current opacity for `in` transitions and from the current opacity to 0 for `out` transitions.
 */
export function height(
  node: Element,
  { delay = 0, duration = 400, easing = x => x, freeze = true }: HeightParams = {},
  { direction }: { direction: 'in' | 'out' },
): TransitionConfig {
  let _height = parseFloat(getComputedStyle(node).height);
  if (!_height || Number.isNaN(_height)) _height = 0;

  let _width = parseFloat(getComputedStyle(node).width);
  if (!_width || Number.isNaN(_width)) _width = 0;

  return {
    delay,
    duration,
    easing,
    css: t => {
      const _css = `height: ${t * _height}px`;
      if (!freeze || direction === 'in') return _css;
      return `${_css};\nwidth: ${_width}px`;
    },
  };
}

export type WidthParams = BaseParams & FreezeParams;

/**
 * Animates the width of an element from 0 to the current width for `in` transitions and from the current width to 0 for `out` transitions.
 */
export function width(
  node: Element,
  { delay = 0, duration = 400, easing = x => x, freeze = true }: WidthParams = {},
  { direction }: { direction: 'in' | 'out' },
): TransitionConfig {
  let _width = parseFloat(getComputedStyle(node).width);
  if (!_width || Number.isNaN(_width)) _width = 0;

  let _height = parseFloat(getComputedStyle(node).height);
  if (!_height || Number.isNaN(_height)) _height = 0;

  return {
    delay,
    duration,
    easing,
    css: t => {
      const _css = `width: ${t * _width}px`;
      if (!freeze || direction === 'in') return _css;
      return `${_css};\nheight: ${_height}px`;
    },
  };
}

export type ScaleFadeParams = ScaleParams & FreezeParams;

/**
 * Animates the opacity and scale of an element. `in` transitions animate from an element's current (default) values to the provided values, passed as parameters. `out` transitions animate from the provided values to an element's default values.
 */
export function scaleFadeInOut(
  node: Element,
  { duration = 400, start = 0.95, freeze = true, ...params }: ScaleFadeParams = {},
  { direction }: { direction: 'in' | 'out' },
): TransitionConfig {
  const { delay, easing, css: scaleCss } = scale(node, { duration, start, ...params });

  let _height = parseFloat(getComputedStyle(node).height);
  if (!_height || Number.isNaN(_height)) _height = 0;

  let _width = parseFloat(getComputedStyle(node).width);
  if (!_width || Number.isNaN(_width)) _width = 0;

  return {
    delay,
    duration,
    easing,
    css: (t, u) => {
      if (!freeze || direction === 'in') return `${scaleCss?.(t, u)}`;
      return [`height: ${_height}px`, `width: ${_width}px`, scaleCss?.(t, u)].join(';\n');
    },
  };
}

export const transition: TransitionProps<{ in?: ScaleFadeParams; out?: ScaleFadeParams }> = {
  in: scaleFadeInOut,
  out: scaleFadeInOut,
  params: { in: { delay: 400 } },
  skipFirst: true,
};
