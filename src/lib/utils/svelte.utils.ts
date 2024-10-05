import type { Component } from 'svelte';

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
  component?: ComponentOrLazy<Props, Exports, Bindings>,
  {
    onLoading,
    onLoaded,
    onError,
  }: {
    onLoading?: () => void;
    onLoaded?: (component?: Component<Props, Exports, Bindings>) => void;
    onError?: (error: unknown) => void;
  } = {},
): Promise<Component<Props, Exports, Bindings> | undefined> => {
  if (!component) return component;
  if (isLazyComponent(component)) {
    onLoading?.();
    try {
      const awaited = await component();
      onLoaded?.(awaited.default);
      return awaited.default;
    } catch (error) {
      onError?.(error);
      return undefined;
    }
  }
  onLoaded?.(component);
  return component;
};
