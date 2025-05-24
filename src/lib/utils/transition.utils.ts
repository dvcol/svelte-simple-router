import type { ScaleFreezeParams } from '@dvcol/svelte-utils/transition';

import type { TransitionProps } from '~/models/component.model.js';

import { scaleFreeze } from '@dvcol/svelte-utils/transition';

export const transition: TransitionProps<{ in?: ScaleFreezeParams; out?: ScaleFreezeParams }> = {
  in: scaleFreeze,
  out: scaleFreeze,
  params: { in: { delay: 400 } },
  skipFirst: { use: scaleFreeze, props: { delay: 100 } },
};
