import type { Component, Snippet } from 'svelte';

export type AnyComponent<
  Props extends Record<string, any> = any,
  Exports extends Record<string, any> = any,
  Bindings extends keyof Props | string = string,
> = Component<Props, Exports, Bindings>;

export type LazyComponentImport<
  Props extends Record<string, any> = any,
  Exports extends Record<string, any> = any,
  Bindings extends keyof Props | string = string,
> = (() => Promise<{ default: AnyComponent<Props, Exports, Bindings> }>) & { _isLazyComponent?: boolean };

export type ComponentOrLazy<
  Props extends Record<string, any> = any,
  Exports extends Record<string, any> = any,
  Bindings extends keyof Props | string = string,
> = (AnyComponent<Props, Exports, Bindings> | LazyComponentImport<Props, Exports, Bindings>) & { _isLazyComponent?: boolean };

export const isLazyComponent = <
  Props extends Record<string, any> = any,
  Exports extends Record<string, any> = any,
  Bindings extends keyof Props | string = string,
>(
  component?: ComponentOrLazy<Props, Exports, Bindings>,
): component is LazyComponentImport<Props, Exports, Bindings> =>
  !!(component && typeof component === 'function' && (component._isLazyComponent || component.name === 'component'));

export type AnySnippet = Snippet<any>;

export const isSnippet = <
  Props extends Record<string, any> = any,
  Exports extends Record<string, any> = any,
  Bindings extends keyof Props | string = string,
>(
  componentOrSnippet: ComponentOrLazy<Props, Exports, Bindings> | AnySnippet,
): componentOrSnippet is AnySnippet => componentOrSnippet?.length === 1;

export const toLazyComponent = <
  Props extends Record<string, any> = any,
  Exports extends Record<string, any> = any,
  Bindings extends keyof Props | string = string,
>(
  fn: () => Promise<unknown>,
): LazyComponentImport<Props, Exports, Bindings> => {
  const component = fn as LazyComponentImport<Props, Exports, Bindings>;
  component._isLazyComponent = true;
  return component;
};

export const resolveComponent = async <
  Props extends Record<string, any> = any,
  Exports extends Record<string, any> = any,
  Bindings extends keyof Props | string = string,
>(
  component?: ComponentOrLazy<Props, Exports, Bindings> | AnySnippet,
  {
    onStart,
    onLoading,
    onLoaded,
    onError,
  }: {
    onStart?: () => unknown | Promise<unknown>;
    onLoading?: () => unknown | Promise<unknown>;
    onLoaded?: (component?: Component<Props, Exports, Bindings> | AnySnippet) => unknown | Promise<unknown>;
    onError?: (error: unknown) => unknown | Promise<unknown>;
  } = {},
): Promise<Component<Props, Exports, Bindings> | AnySnippet | undefined> => {
  await onStart?.();
  if (component && !isSnippet(component) && isLazyComponent(component)) {
    onLoading?.();
    try {
      const awaited = await component();
      await onLoaded?.(awaited.default);
      return awaited.default;
    } catch (error) {
      await onError?.(error);
      return undefined;
    }
  }
  onLoaded?.(component);
  return component;
};
