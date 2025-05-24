<script lang="ts">
  import type { TransitionFunction, TransitionWithProps } from '@dvcol/svelte-utils/transition';
  import type { Snippet } from 'svelte';

  import type { TransitionProps } from '~/models/component.model.js';

  import { toStyle } from '@dvcol/common-utils/common/class';
  import { mutation } from '@dvcol/svelte-utils/mutation';

  const { children, key, id, transition }: { children: Snippet; id: string; key: any | any[]; transition: TransitionProps } = $props();

  let firstRender = true;
  const skipFirst = $derived<TransitionProps['skipFirst']>(transition?.skipFirst ?? false);
  const skipTransition = (skip = skipFirst) => {
    if (!firstRender) return false;
    firstRender = false;
    return skip === true;
  };

  const isTransitionFunction = (skip?: TransitionProps['skipFirst']): skip is TransitionFunction => typeof skip === 'function' && !!skip;
  const isTransitionObject = (skip?: TransitionProps['skipFirst']): skip is TransitionWithProps => typeof skip === 'object' && !!skip?.use;

  const _in = $derived<TransitionFunction>(((node, props, options) => {
    if (skipTransition()) return;
    if (firstRender && isTransitionFunction(skipFirst)) return skipFirst;
    if (firstRender && isTransitionObject(skipFirst)) return skipFirst.use;
    return transition?.in?.(node, props, options);
  }) as TransitionFunction);
  const _out = $derived<TransitionFunction>(((node, props, options) => {
    if (firstRender && skipFirst) return;
    return transition?.out?.(node, props, options);
  }) as TransitionFunction);

  const _inParams = $derived.by(() => {
    if (firstRender && isTransitionObject(skipFirst) && skipFirst.props) return skipFirst.props;
    return transition?.params?.in ?? {};
  });
  const _outParams = $derived(transition?.params?.out ?? {});

  const _containerProps = $derived(transition?.props?.container);
  const _wrapperProps = $derived(transition?.props?.wrapper);

  const _style = $derived.by(() => {
    if (!transition?.viewTransitionName) return toStyle(_containerProps?.style);
    let _name = transition?.viewTransitionName;
    if (typeof _name === 'boolean') _name = `sr-container-${id}`;
    return toStyle(`--container-transition-name: ${_name}`, _containerProps?.style);
  });

  const ifElement = (node?: Node | null): HTMLElement | undefined => {
    if (node instanceof HTMLElement) return node;
  };

  const _mutation = $derived((record: MutationRecord, index: number, entries: MutationRecord[]) => {
    if (transition?.discard === false) return;
    if (typeof transition?.discard === 'function' && !transition.discard(record, index, entries)) return;
    if (!ifElement(record.previousSibling?.previousSibling)?.inert) return;
    ifElement(record.previousSibling)?.remove();
  });
</script>

<div data-transition-id="container" {..._containerProps} style={_style} use:mutation={{ callback: _mutation, options: { childList: true } }}>
  {#if transition?.in || transition?.out}
    {#key key}
      <div data-transition-id="wrapper" in:_in={_inParams} out:_out={_outParams} {..._wrapperProps} style={toStyle(_wrapperProps?.style)}>
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
