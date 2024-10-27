import { debounce } from '@dvcol/common-utils/common/debounce';

export function debounced<T>(getter: () => T, delay = 0, cb?: (error: unknown) => void): () => T | undefined {
  let current = $state<T>();
  const update = debounce((v: T) => {
    current = v;
  }, delay);
  $effect(() => {
    update(getter()).catch(cb);
  });
  return () => current;
}
