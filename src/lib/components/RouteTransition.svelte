<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { TransitionFunction, TransitionProps } from '~/models/router.model.js';

  const { children, key, transition }: { children: Snippet; key: any | any[]; transition: TransitionProps } = $props();

  let firstRender = true;
  const skipFirst = $derived<boolean>(transition?.skipFirst ?? true);
  const skipTransition = (skip = skipFirst) => {
    if (!firstRender || !skip) return false;
    firstRender = false;
    return true;
  };

  const _in = $derived<TransitionFunction>(((node, props, options) => {
    if (skipTransition()) return;
    return transition?.in?.(node, props, options);
  }) as TransitionFunction);
  const _out = $derived<TransitionFunction>(((node, props, options) => transition?.out?.(node, props, options)) as TransitionFunction);

  const _inParams = $derived(transition?.params?.in || {});
  const _outParams = $derived(transition?.params?.out ?? {});
  const _transitionProps = $derived(transition?.props);
</script>

{#key key}
  <div class="transition-container" in:_in={_inParams} out:_out={_outParams} {..._transitionProps}>
    {@render children?.()}
  </div>
{/key}
