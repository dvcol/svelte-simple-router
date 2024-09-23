<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { ParsedRoute, TransitionFunction, TransitionProps } from '~';

  const { children, route, transition }: { children: Snippet; route: ParsedRoute; transition: TransitionProps } = $props();

  let firstRender = true;
  const skipFirst = $derived<boolean>(transition?.skip ?? true);
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

{#key route?.path}
  <div class="transition-container" in:_in={_inParams} out:_out={_outParams} {..._transitionProps}>
    {@render children?.()}
  </div>
{/key}
