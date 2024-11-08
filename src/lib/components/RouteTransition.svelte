<script lang="ts">
  import type { TransitionFunction } from '@dvcol/svelte-utils/transition';
  import type { Snippet } from 'svelte';
  import type { TransitionProps } from '~/models/component.model.js';

  const { children, key, id, transition }: { children: Snippet; id: string; key: any | any[]; transition: TransitionProps } = $props();

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

  const _inParams = $derived(transition?.params?.in ?? {});
  const _outParams = $derived(transition?.params?.out ?? {});

  const _containerProps = $derived(transition?.props?.container);
  const _wrapperProps = $derived(transition?.props?.wrapper);

  const _style = $derived.by(() => {
    if (!transition?.viewTransitionName) return _containerProps?.style;
    let _name = transition?.viewTransitionName;
    if (typeof _name === 'boolean') _name = `sr-container-${id}`;
    return [`--container-transition-name: ${_name}`, _containerProps?.style].filter(Boolean).join('; ');
  });
</script>

<div data-transition-id="container" {..._containerProps} style={_style}>
  {#if transition?.in || transition?.out}
    {#key key}
      <div data-transition-id="wrapper" in:_in={_inParams} out:_out={_outParams} {..._wrapperProps}>
        {@render children?.()}
      </div>
    {/key}
  {:else}
    {@render children?.()}
  {/if}
</div>

<style lang="scss">
  /* stylelint-disable selector-pseudo-class-no-unknown */
  div[data-transition-id='container'] {
    view-transition-name: var(--container-transition-name);

    &:global(:has(div[data-transition-id='wrapper']:not(:only-child))) {
      position: relative;

      div[data-transition-id='wrapper']:not(:first-child) {
        position: absolute;

        &:not(:last-child) {
          visibility: hidden;
          pointer-events: none;
        }
      }
    }
  }
</style>
