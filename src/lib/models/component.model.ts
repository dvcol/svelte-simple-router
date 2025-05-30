import type { Values } from '@dvcol/common-utils/common/class';
import type { TransitionFunction, TransitionProps as TransitionParams, TransitionWithProps } from '@dvcol/svelte-utils/transition';
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

import type { ErrorListener, NavigationEndListener, NavigationGuard, NavigationListener, ViewChangeListener } from '~/models/navigation.model.js';
import type { PartialRoute, Route, RouteName } from '~/models/route.model.js';
import type { IRouter, RouterOptions } from '~/models/router.model.js';
import type { IDefaultView } from '~/models/view.model.js';

export type HTMLProps = Partial<Omit<HTMLAttributes<HTMLDivElement>, 'style'>> & {
  style?: Values;
};

export interface RouterContextProps<Name extends RouteName = any> {
  /**
   * Router instance to use.
   */
  router?: IRouter<Name>;
  /**
   * Router options to use when creating a new router instance.
   */
  options?: RouterOptions<Name>;
  /**
   * Children to render within the view container.
   */
  children?: Snippet<[IRouter<Name>]>;
}

export type TransitionDiscardFunction = (entry: MutationRecord, index: number, entries: MutationRecord[]) => boolean;

export interface TransitionProps<
  T extends { in?: TransitionParams; out?: TransitionParams; first?: TransitionParams } = { in?: TransitionParams; out?: TransitionParams; first?: TransitionParams },
> {
  /**
   * If `true`, the transition will be updated on any route change.
   * By default, the transition is only triggered when the component changes to avoid unnecessary mounting and unmounting.
   *
   * @default false
   */
  updateOnRouteChange?: boolean;
  /**
   * If `true`, the transition will be updated on any props change.
   * By default, the transition is only triggered when the component changes to avoid unnecessary mounting and unmounting.
   */
  updateOnPropsChange?: boolean;
  /**
   * Transition to use when navigating to a new route.
   */
  in?: TransitionFunction<T['in']>;
  /**
   * Transition to use when navigating away from the current route.
   */
  out?: TransitionFunction<T['out']>;
  /**
   * The enter transition to use when the route is first loaded.
   * This is useful when the first route load is fast and the transition is not needed.
   *
   * If `false`, no transition will be applied on the first route load.
   * If `true`, the transition will be applied.
   * If a function is provided, it will be called with the `in` transition parameters.
   * If a transition object is provided, it will be used as the transition function and parameters.
   *
   * @default true
   */
  first?: boolean | TransitionFunction<T['first']> | TransitionWithProps<TransitionParams>;
  /**
   * Transition parameters to be passed to the transition functions.
   */
  params?: {
    in?: T['in'];
    out?: T['out'];
  };
  props?: {
    container?: HTMLProps;
    wrapper?: HTMLProps;
  };
  /**
   * The view transition api name to use.
   * If `true`, a unique id will be generated.
   *
   * @example sr-container-<router-id>-<view-id>
   * @see [view transition api](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
   */
  viewTransitionName?: boolean | string;
  /**
   * Optional delay before displaying routing and loading views.
   *
   * @default 0
   */
  delay?: number | {
    routing?: number;
    loading?: number;
  };
  /**
   * Whether to discard stale transitions when multiple transitions are triggered.
   * This is useful when the transition is triggered multiple times in quick succession and intro/outro transitions have not yet completed.
   *
   * By default, only the first inert elements and the latest node are kept.
   *
   * @default true
   */
  discard?: boolean | TransitionDiscardFunction;
}

export interface RouteContainerProps<Name extends RouteName = any> {
  /**
   * Name of the router view to render.
   * If not provided, the default view will be used.
   */
  name?: Name | IDefaultView;
  /**
   * Transition to use when navigating between routes.
   */
  transition?: TransitionProps;
  /**
   * Navigation guard passed to the router instance.
   * @awaited
   */
  beforeEach?: NavigationGuard<Name>;
  /**
   * Error listener to execute when the navigation fails or the view fails to load.
   */
  onError?: ErrorListener<Name>;
  /**
   * Navigation listener to execute when the navigation starts.
   * @awaited
   */
  onStart?: NavigationListener<Name>;
  /**
   * Navigation end listener to execute when the navigation ends.
   */
  onEnd?: NavigationEndListener<Name>;
  /**
   * Route change listener to execute when the route changes and before the view change starts.
   * @awaited
   */
  onChange?: ViewChangeListener<Name>;
  /**
   * Loading listener to execute when the view starts loading.
   * @awaited
   */
  onLoading?: ViewChangeListener<Name>;
  /**
   * Loaded listener to execute when the view is loaded.
   * @awaited
   */
  onLoaded?: ViewChangeListener<Name>;
  /**
   * Routing snippet to display while the route is being resolved.
   */
  routing?: Snippet<[IRouter<Name>['routing']]>;
  /**
   * Loading snippet to display while the route is loading.
   * Route loading component will take precedence over this.
   *
   * @see {@link RouteComponents.loadings}
   * @see {@link RouteComponent.loading}
   */
  loading?: Snippet<[IRouter<Name>['route']]>;
  /**
   * Error snippet to display if the route fails to load.
   * Route error component will take precedence over this.
   *
   * @see {@link RouteComponents.errors}
   * @see {@link RouteComponent.error}
   */
  error?: Snippet<[Error | any]>;
  /**
   * Children to render when the router is ready.
   */
  children?: Snippet<[IRouter<Name>]>;
}

export type RouterViewProps<Name extends RouteName = any> = RouterContextProps<Name> & RouteContainerProps<Name>;
export type RouteViewProps<Name extends RouteName = any> = Pick<RouterViewProps<Name>, 'loading' | 'error' | 'name'> & {
  /**
   * Route to inject into the router.
   */
  route: PartialRoute<Name>;
  /**
   * Children to render when the router is ready.
   */
  children?: Snippet;
} & Partial<Record<Name, Route<Name>['component']>>;

export function isTransitionFunction(skip?: TransitionProps['first']): skip is TransitionFunction {
  return typeof skip === 'function' && !!skip;
};
export function isTransitionObject(skip?: TransitionProps['first']): skip is TransitionWithProps {
  return typeof skip === 'object' && !!skip?.use;
};
