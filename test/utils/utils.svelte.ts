export const runInEffect = (fn: () => void) => $effect.root(fn)();
