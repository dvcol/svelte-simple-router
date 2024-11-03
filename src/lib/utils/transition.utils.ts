import { scaleFadeInOut, type ScaleFadeParams } from '@dvcol/svelte-utils/transition';

import type { TransitionProps } from '~/models/component.model.js';

export const transition: TransitionProps<{ in?: ScaleFadeParams; out?: ScaleFadeParams }> = {
  in: scaleFadeInOut,
  out: scaleFadeInOut,
  params: { in: { delay: 400 } },
  skipFirst: true,
};
