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
  const _out = $derived<TransitionFunction>(((node, props, options) => {
    if (firstRender && skipFirst) return;
    return transition?.out?.(node, props, options);
  }) as TransitionFunction);

  const _inParams = $derived(transition?.params?.in || {});
  const _outParams = $derived(transition?.params?.out ?? {});
  const _containerProps = $derived(transition?.props?.container);
  const _wrapperProps = $derived(transition?.props?.wrapper);
</script>

<div data-transition-id="transition-container" {..._containerProps}>
  {#key key}
    <div data-transition-id="transition-wrapper" in:_in={_inParams} out:_out={_outParams} {..._wrapperProps}>
      {@render children?.()}
    </div>
  {/key}
</div>

<style lang="scss">
  /* stylelint-disable selector-pseudo-class-no-unknown */
  div[data-transition-id='transition-container']:has(div[data-transition-id='transition-wrapper'][inert]) {
    position: relative;

    :not(:first-child) {
      position: absolute;

      &[inert] {
        display: none;
      }
    }
  }
</style>
