import type { Component } from 'svelte';

export type AnyComponent<
  Props extends Record<string, any> = any,
  Exports extends Record<string, any> = any,
  Bindings extends keyof Props | '' = string,
> = Component<Props, Exports, Bindings>;

export type LazyComponentImport<
  Props extends Record<string, any> = any,
  Exports extends Record<string, any> = any,
  Bindings extends keyof Props | '' = string,
> = () => Promise<{ default: AnyComponent<Props, Exports, Bindings> }>;

export type ComponentOrLazy<
  Props extends Record<string, any> = any,
  Exports extends Record<string, any> = any,
  Bindings extends keyof Props | '' = string,
> = AnyComponent<Props, Exports, Bindings> | LazyComponentImport<Props, Exports, Bindings>;

export const isLazyComponent = <
  Props extends Record<string, any> = any,
  Exports extends Record<string, any> = any,
  Bindings extends keyof Props | '' = string,
>(
  component?: ComponentOrLazy<Props, Exports, Bindings>,
): component is LazyComponentImport<Props, Exports, Bindings> => !!(component && typeof component === 'function' && component.name === 'component');

export const resolveComponent = async <
  Props extends Record<string, any> = any,
  Exports extends Record<string, any> = any,
  Bindings extends keyof Props | '' = string,
>(
  component?: ComponentOrLazy<Props, Exports, Bindings>,
  {
    onLoading,
    onLoaded,
    onError,
  }: {
    onLoading?: () => void;
    onLoaded?: () => void;
    onError?: (error: unknown) => void;
  } = {},
): Promise<Component<Props, Exports, Bindings> | undefined> => {
  if (!component) return component;
  if (isLazyComponent(component)) {
    onLoading?.();
    try {
      const awaited = await component();
      onLoaded?.();
      return awaited.default;
    } catch (error) {
      onError?.(error);
      throw error;
    }
  }
  onLoaded?.();
  return component;
};
